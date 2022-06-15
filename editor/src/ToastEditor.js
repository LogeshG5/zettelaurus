import React from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import './ToastEditor.css';

var Editor;
Editor = require('@toast-ui/react-editor').Editor;

class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = "http://localhost:8888"
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
        el: this.createWikiButton(),
        popup: {
          className: 'toastui-editor-popup-add-link',
          body: this.createPopup(),
          style: {}
        },
        tooltip: 'Create Wiki'
      },
      {
        el: this.createSaveButton(),
        command: '',
        tooltip: 'Save document'
      },
      {
        el: this.createLivePreviewButton(),
        command: '',
        tooltip: 'Live preview'
      },
      ]
    ];

  componentDidMount() {
    setTimeout(() => document.title = "Editor | " + this.path.fileName, 1000);
    this.editorRef.current?.getInstance().addHook('addImageBlobHook', (blob, callback) => {
      this.uploadImage(blob).then(ret => {
        callback(ret.url, ret.fileName);
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
    console.log("setting event listeners");
    const cnt = document.getElementById("editor-container");
    cnt.addEventListener("keydown", (e) => this.keydown(e));
    document.addEventListener("visibilitychange", () => this.delayedSave());
  }

  delayedSave() {

    // Delayed save is now disabled
    // Save immediately if not data is lost 
    // while editing multiple documents simultaneously in hot reload mode
    if (document.visibilityState === "hidden") {
      this.saveClick();
    }

    // delayed save is needed for the below case
    // if you leave to copy some contents and come back
    // document is saved and hot reloaded causing cursor to go to the end
    // So cursor position lost is annoying while leaving tab

    // save on 20 secs after focus lost
    // setTimeout(() => {
    // }, "20000");

  }

  keydown(e) {
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      console.log("pressing save");
      if (this.editorRef.current) {
        const editor = this.editorRef.current.getInstance();
        editor.exec('strike');
      }
      this.saveClick();
      e.preventDefault();
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

  createWikiButton() {
    const button = document.createElement('button');
    button.className = 'toastui-editor-toolbar-icons last';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.innerHTML = `+`;
    button.type = 'button';
    return button;
  }


  createLivePreviewButton() {
    const button = document.createElement('button');
    button.className = 'toastui-editor-toolbar-icons';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.innerHTML = `Live`
    button.type = 'button';
    button.addEventListener('click', () => {
      const editUrl = '/edit'
      const url = window.location.pathname.slice(editUrl.length).replace(".md", "").replace(".mdx", "");
      window.open("http://localhost:3000" + url, "_blank");
    });
    return button;
  }

  createPopup() {
    const el = document.createElement('div');
    el.ariaLabel = "Create Wiki";
    const label = document.createElement('label');
    label.innerHTML = "Title";
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'create-wiki-name';
    el.appendChild(label);
    el.appendChild(input);
    const cont = document.createElement('div');
    cont.className = "toastui-editor-button-container";
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = "toastui-editor-close-button";
    cancel.innerHTML = "Cancel";
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = "toastui-editor-ok-button";
    ok.innerHTML = "Ok";
    cont.appendChild(cancel);
    cont.appendChild(ok);
    el.appendChild(cont);
    cancel.addEventListener("click", () => { this.editorRef.current?.getInstance().eventEmitter.emit('closePopup'); });
    ok.addEventListener("click", () => { this.createWiki(); input.value = ""; });
    return el;
  }

  createNewDoc(dir, title) {
    const text = "# " + title + "\n\n";
    const fileName = title.replaceAll(" ", "-").toLowerCase() + ".md";
    let file = new File([text], fileName);
    this.uploadFile(file, dir, fileName);
    window.open('http://localhost:8889/edit/docs/' + dir + "/" + fileName);
  }

  createWiki() {
    const title = document.getElementById("create-wiki-name").value;
    this.createNewDoc(this.path.dir, title);
    this.editorRef.current?.getInstance().eventEmitter.emit('closePopup');
    this.editorRef.current?.getInstance().insertText("[[" + title + "]]");
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

    // To protect against accidentally saving empty doc after pressing ctrl+z
    if (text === "") return;

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
    const selectedText = this.editorRef.current?.getInstance().getSelectedText();
    var fileName = "";

    if (selectedText !== "") {
      const ext = file.name.split('.').pop();
      fileName = selectedText + '.' + ext;
    }
    else {
      const timestamp = (new Date()).toJSON()
        .replaceAll(":", "-")
        .replace("T", "-")
        .replace(/\.[0-9]*z/i, '');
      fileName = this.path.fileName.replace(".md", "")
        + "-" + timestamp
        + "-" + file.name;
    }

    fileName = fileName.toLowerCase().split(" ").join("-");
    await this.uploadFile(file, this.path.dir, fileName);
    // var uploadedUrl = this.serverUrl + "/files/" + this.path.dir + "/" + fileName;
    // uploadedUrl is not needed as it can change, rather we need the relative path of the image
    return { url: fileName, fileName: selectedText };
  }

  render() {
    return (
      <Editor
        previewStyle="tab"
        height="auto"
        initialEditType="markdown"
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
    < div className="container" id="editor-container">
      <div className="row">
        <EditorApp {...props} />
      </div >
    </div >);
}
