import React, { useState, useEffect } from 'react';
import RMEditor from "rich-markdown-editor";

export default class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.saveTextCb;
    this.state = { mdText: "" };
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.loadContent(this.path.fullPath);
    document.title = "Editor | " + document.title;
  }

  componentDidMount() {
  }

  setMdText(text) {
    this.setState({ mdText: text });
  }

  parseFileDetails() {
    const editorBasePath = '/edit/docs/';
    const url = window.location.pathname
      .slice(editorBasePath.length)
      .replace(/\/$/, '');
    const fullPath = `${url}.md`;
    const fileName = url.slice(url.lastIndexOf("/") + 1);
    let dir = "";
    if (url.lastIndexOf("/") != -1) {
      dir = url.slice(0, url.lastIndexOf("/")) + "/";
    }
    const dict = { fileName: fileName, fullPath: fullPath, dir: dir };
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
    // Workaround to remove empty backslash in new line
    text = text.replace(/\\/g, '');
    let file = new File([text], this.path.fileName + ".md");
    this.uploadFile(file, this.path.dir, this.path.fileName + ".md");
  }

  async uploadImage(file) {
    let timestamp = (new Date()).toJSON().replaceAll(":", "-");
    var fileName = this.path.fileName + "-" + timestamp
      + "-" + file.name;
    fileName = fileName.toLowerCase().split(" ").join("-");
    await this.uploadFile(file, this.path.dir, fileName);
    var uploadedUrl = this.serverUrl + "/files/" + this.path.dir + fileName;
    return uploadedUrl;
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <RMEditor
            value={this.state.mdText}
            readOnly={false}
            onChange={(cb) => this.saveTextCb = cb}
            onSave={(val) => this.saveClick()}
            uploadImage={async (file) => await this.uploadImage(file)}
          />
        </div >
      </div >
    )
  }
}

