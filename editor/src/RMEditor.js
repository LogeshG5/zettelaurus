import React, { useState, useEffect } from 'react';
import Editor from "rich-markdown-editor";
// WARN
// Owner does not maintain RM Editor, so deps are outdated and not usable. 

class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = "http://localhost:8888";
    this.saveTextCb = null;
    this.state = { mdText: "" };
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.loadContent(this.path.fullPath);
  }

  componentDidMount() {
    setTimeout(() => document.title = "Editor | " + this.path.fileName, 1000);
    const textEditor = document.getElementsByClassName('ProseMirror')[0];
    textEditor.style.height = "100vh";
  }

  setEventListeners() {
    console.log("setting event listeners");
    const cnt = document.getElementById("editor-container");
    cnt.addEventListener("keydown", (e) => this.keydown(e));
    document.addEventListener("visibilitychange", () => this.delayedSave());
  }

  keydown(e) {
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      console.log("pressing save");
      if (this.editorRef.current) {
        const editor = this.editorRef.current.getInstance();
        // Currently all shortcuts are disabled, so this is not needed
        // editor.exec('strike'); 
      }
      this.saveClick();
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
      const editor = this.editorRef.current.getInstance();
      editor.exec('bold');
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && (e.key === 'i' || e.key === 'I')) {
      const editor = this.editorRef.current.getInstance();
      editor.exec('italic');
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
      const editor = this.editorRef.current.getInstance();
      editor.exec('undo');
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
      const editor = this.editorRef.current.getInstance();
      editor.exec('redo');
      e.preventDefault();
      return true;
    }
    else if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
      this.openLive();
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

  setMdText(text) {
    this.setState({ mdText: text });
  }

  parseFileDetails() {
    const editorBasePath = '/edit/docs/';
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
        this.setMdText(blob);
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
    let text = this.saveTextCb();
    // Workaround to remove empty backslash in new line and \[\]
    text = text.replace(/\\/gm, '');
    text = text.replace(/\r/gm, '');

    // To protect against accidentally saving empty doc after pressing ctrl+z
    if (text === "") return;

    let file = new File([text], this.path.fileName);
    const success = this.uploadFile(file, this.path.dir, this.path.fileName);
    if (success) {
      this.dirty = false;
      //Toastify({ text: "Saved", duration: 1000 }).showToast();
    }
    else {
      //Toastify({ text: "Save Failed", duration: 1000 }).showToast();
    }
  }

  async uploadImage(file) {
    const timestamp = (new Date()).toJSON()
      .replaceAll(":", "-")
      .replace("T", "-")
      .replace(/\.[0-9]*z/i, '');
    const fileName = this.path.fileName.replace(".md", "")
      + "-" + timestamp
      + "-" + file.name;

    fileName = fileName.toLowerCase().split(" ").join("-");
    await this.uploadFile(file, this.path.dir, fileName);
    var uploadedUrl = this.serverUrl + "/files/" + this.path.dir + "/" + fileName;
    return fileName;
  }

  render() {
    return (
      <Editor
        value={this.state.mdText}
        readOnly={false}
        onChange={(cb) => this.saveTextCb = cb}
        onSave={(val) => this.saveClick()}
        uploadImage={async (file) => await this.uploadImage(file)}
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

