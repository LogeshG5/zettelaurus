import React, { useState, useEffect } from 'react';
import RMEditor from "rich-markdown-editor";
function post(path, params, method = 'post') {

  const form = document.createElement('form');
  form.method = method;
  form.action = path;
  // form.enctype = 'multipart/form-data';

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

export default class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    // this.mdText = "";
    this.saveTextCb;
    this.state = { mdText: "" };

    // document.addEventListener('keydown', e => {
    //   if (e.ctrlKey && e.key === 's') {
    //     // Prevent the Save dialog to open
    //     e.preventDefault();
    //     saveClick();
    //   }
    // });
    this.filePath = this.extractFilePath();
    this.loadContent(this.filePath);
  }

  componentDidMount() {
  }

  setMdText(text) {
    this.setState({ mdText: text });
  }

  extractFilePath() {
    const editorBasePath = '/edit/docs/';
    let filePath = window.location.pathname
      .slice(editorBasePath.length)
      .replace(/\/$/, '');

    const contentPath = `${filePath}.md`;
    return contentPath;
  }


  loadContent(path) {
    fetch('http://localhost:8888/files/' + path)
      .then(response => response.text()) // Gets the response and returns it as a blob
      .then(blob => {
        this.setMdText(blob);
        console.log("request content");
      });
  }

  saveClick() {
    let text = this.saveTextCb();
    text = text.replace(/\\/g, '');
    post("http://localhost:8888/post-file", { fileContents: text, filePath: this.filePath, editUrl: window.location.pathname });
  }

  render() {
    return (
      <RMEditor
        value={this.state.mdText}
        readOnly={false}
        onChange={(cb) => this.saveTextCb = cb}
        onSave={(val) => this.saveClick()}
        uploadImage={async file => {
          console.log(file)
          // post("http://localhost:8888/post-file", { fileContents: file, filePath: this.filePath.replace(".md", ".jpg"), editUrl: window.location.pathname });
          return "http://localhost:8888/files/" + this.filePath.replace(".md", ".jpg");
        }}
      />
    )
  }
}

