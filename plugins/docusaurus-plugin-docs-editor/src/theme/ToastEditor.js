import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import BrowserOnly from '@docusaurus/BrowserOnly';
import React, { useState, useEffect } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
var Editor;
if (ExecutionEnvironment.canUseDOM) {
  Editor = require('@toast-ui/react-editor').Editor;
}
class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.loadContent(this.path.fullPath);
  }
  content = "";
  dirty = false;
  loaded = false;
  editorRef = React.createRef();
  toolbarItems =
    [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      // Using Option: Customize the last button
      [{
        el: this.createSaveButton(),
        command: '',
        tooltip: 'Save document'
      }]
    ];

  componentDidMount() {
    setTimeout(() => document.title = "Editor | " + this.path.fileName, 1000);
    this.editorRef.current?.getInstance().addHook('addImageBlobHook', (blob, callback) => {
      this.uploadImage(blob).then(url => {
        callback(url, 'img');
      });
    });
    this.setStyle();
    this.setEventListeners();
    console.log("mounted");
  }

  setStyle() {
    const textEditor = document.getElementsByClassName('auto-height')[0];
    textEditor.style.width = "100%";
  }

  setEventListeners() {
    const cnt = document.getElementById("editor-container");
    cnt.addEventListener("keydown", (e) => this.keydown(e));
    document.addEventListener("visibilitychange", () => this.delayedSave());
  }

  delayedSave() {
    // save on 20 secs after focus lost
    setTimeout(() => {
      if (document.visibilityState == "hidden") {
        this.saveClick();
      }
    }, "20000");
  }

  keydown(e) {
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      console.log("pressing save");
      e.preventDefault();
      if (this.editorRef.current) {
        const editor = this.editorRef.current.getInstance();
        editor.exec('strike');
      }
      this.saveClick();
      return true;
    }
    else if (e.ctrlKey && e.key === '1') {
      const editor = this.editorRef.current.getInstance();
      editor.exec('heading', { level: 1 });
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && e.key === '2') {
      const editor = this.editorRef.current.getInstance();
      editor.exec('heading', { level: 2 });
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && e.key === '3') {
      const editor = this.editorRef.current.getInstance();
      editor.exec('heading', { level: 3 });
      e.preventDefault();
      return true;
    }
  }

  onChange(event) {
    this.dirty = true;
  }

  createSaveButton() {
    const button = document.createElement('button');

    button.className = 'toastui-editor-toolbar-icons last';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.innerHTML = `<i>Save</i>`;
    button.addEventListener('click', () => {
      this.saveClick();
    });

    return button;
  }

  parseFileDetails() {
    const editorBasePath = '/edit/docs/'; // previously '/edit/docs/'
    let url = window.location.pathname
      .slice(editorBasePath.length);
    let urlarr = url.split("/");
    let fullPath = url;
    let fileName = urlarr.pop();
    let dir = urlarr.join("/");
    const dict = { fileName: fileName, fullPath: fullPath, dir: dir };
    // console.log("dict", dict);
    return dict;
  }

  loadContent(path) {
    fetch(this.serverUrl + "/files/" + path)
      .then(response => response.text()) // Gets the response and returns it as a blob
      .then(blob => {
        this.editorRef.current?.getInstance().setMarkdown(blob);
        this.content = this.editorRef.current.getInstance().getMarkdown();
        this.loaded = true;
      });
  }

  async uploadFile(blob, dir, fileName) {
    let formData = new FormData();
    formData.append("dir", dir);
    formData.append("file", blob, fileName);
    const url = this.serverUrl + '/upload-file';
    let response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    // let result = await response.json();
    // console.log(result.message);
    if (response.ok) {
      return true;
    }
    else {
      return false;
    }
  }

  saveClick() {
    if (!this.editorRef.current || !this.loaded) return;
    let text = this.editorRef.current?.getInstance().getMarkdown();
    text = text.replaceAll("<br>", "");
    if (text !== this.content) {
      this.content = text;
      let file = new File([text], this.path.fileName);
      const success = this.uploadFile(file, this.path.dir, this.path.fileName);
      if (success) {
        this.dirty = false;
        Toastify({ text: "Saved", duration: 1000 }).showToast();
      }
      else {
        Toastify({ text: "Save Failed", duration: 1000 }).showToast();
      }
    }
    else {
      console.log("upload avoided");
    }
  }

  async uploadImage(file) {
    let timestamp = (new Date()).toJSON().replaceAll(":", "-");
    var fileName = this.path.fileName + "-" + timestamp
      + "-" + file.name;
    fileName = fileName.toLowerCase().split(" ").join("-");
    await this.uploadFile(file, this.path.dir, fileName);
    var uploadedUrl = this.serverUrl + "/files/" + this.path.dir + "/" + fileName;
    return uploadedUrl;
  }

  render() {
    return (
      <Editor
        previewStyle="tab"
        height="auto"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        extendedAutolinks={true}
        ref={this.editorRef}
        onChange={(cb) => this.onChange(cb)}
        toolbarItems={this.toolbarItems}
      />
    )
  }
}

// EditorApp;
export default function EditorFn(props) {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        return (
          < div className="container" id="editor-container">
            <div className="row">
              <EditorApp {...props} />
            </div >
          </div >)
      }}
    </BrowserOnly >
  );
}
