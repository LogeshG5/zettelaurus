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

async function uploadImage(blob, dir, fileName) {
  let formData = new FormData();
  formData.append("dir", dir);
  formData.append("file", blob, fileName);

  let response = await fetch('http://localhost:8888/upload-file', {
    method: 'POST',
    body: formData
  });
  let result = await response.json();
  console.log(result.message);
}

export default class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    // this.mdText = "";
    this.saveTextCb;
    this.state = { mdText: "" };

    this.filePath = this.extractFilePath();
    this.loadContent(this.filePath);
    document.title = "Editor | " + document.title;
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
          let timestamp = (new Date()).toJSON().replaceAll(":", "-");
          var fileName = this.filePath.replace(".md", "").slice(this.filePath.indexOf("/") + 1) + "-" + timestamp + "-" + file.name;
          fileName = fileName.toLowerCase().split(" ").join("-");
          var dir = this.filePath.slice(0, this.filePath.lastIndexOf("/"));
          console.log(fileName);
          await uploadImage(file, dir, fileName);
          return "http://localhost:8888/files/" + dir + "/" + fileName;
        }}
      />
    )
  }
}

