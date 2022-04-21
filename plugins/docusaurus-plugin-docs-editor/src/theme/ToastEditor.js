import React, { useState, useEffect } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

export default class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.saveTextCb;
    this.state = { mdText: "" };
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.loadContent(this.path.fullPath);
    document.addEventListener("keydown", (e) => this.keydown(e));
  }

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
        console.log("url", url);
        callback(url, 'img');
      });
    });
  }

  keydown(e) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.saveClick();
      return true;
    }
  }

  setMdText(text) {
    this.setState({ mdText: text });
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
    const editorBasePath = '/edit/docs/';
    let url = window.location.pathname
      .slice(editorBasePath.length);
    console.log("url", url);
    let fullPath = "";
    let fileName = "";
    let dir = "";
    if (url[url.length - 1] == "/") {
      fullPath = `${url}index.md`;
      url = url.slice(0, -1);
      fileName = "index";
      dir = url + "/";
    }
    else {
      fullPath = `${url}.md`;
      fileName = url.slice(url.lastIndexOf("/") + 1);
      dir = url.slice(0, url.lastIndexOf("/")); // Fix cant save files in the root like docs/intro.md
    }

    const dict = { fileName: fileName, fullPath: fullPath, dir: dir };
    console.log("dict", dict);
    return dict;
  }

  loadContent(path) {
    fetch(this.serverUrl + "/files/" + path)
      .then(response => response.text()) // Gets the response and returns it as a blob
      .then(blob => {
        this.setMdText(blob);
        this.editorRef.current?.getInstance().setMarkdown(blob);
      });
  }

  async uploadFile(blob, dir, fileName) {
    let formData = new FormData();
    formData.append("dir", dir);
    formData.append("file", blob, fileName);

    let response = await fetch(this.serverUrl + '/upload-file', {
      method: 'POST',
      body: formData
    });
    let result = await response.json();
    console.log(result.message);
  }

  saveClick() {
    let text = this.editorRef.current?.getInstance().getMarkdown();
    text = text.replaceAll("<br>", "");
    let file = new File([text], this.path.fileName + ".md");
    this.uploadFile(file, this.path.dir, this.path.fileName + ".md");
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
      <div className="container">
        <div className="row">
          <Editor
            initialValue={this.state.mdText}
            previewStyle="tab"
            height="auto"
            width="100vh"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            extendedAutolinks={true}
            ref={this.editorRef}
            onChange={(cb) => this.saveTextCb = cb}
            toolbarItems={this.toolbarItems}
          />
        </div >
      </div >
    )
  }
}
