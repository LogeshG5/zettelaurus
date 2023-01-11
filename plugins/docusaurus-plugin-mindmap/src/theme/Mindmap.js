import React, { useState, useRef, useEffect } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view/dist/index.esm';

import './style.css';

const transformer = new Transformer();
const initValue = `# markmap

- beautiful
- useful
- easy
- interactive
`;

class EditorApp extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.value = "";
    this.loadContent(this.path.fullPath);
    this.refSvg = React.createRef(); // Ref for SVG element
    this.refMm = React.createRef(); // Ref for markmap object
  }

  componentDidMount() {
    setTimeout(() => document.title = "MindMap | " + this.path.fileName, 1000);
    console.log("mounted");


  }

  parseFileDetails() {
    const editorBasePath = '/mindmap/docs/';
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
        this.value = blob;
        console.log("value updated", this.value);
        this.refMm.current = Markmap.create(this.refSvg.current);
        const { root } = transformer.transform(this.value);
        this.refMm.current.setData(root);
        this.refMm.current.fit();
      });
  }

  handleChange(e) {
    setValue(e.target.value);
  }

  render() {
    return (
      <div height="100%">
        <svg height="100vh" width="100hh" ref={this.refSvg} />
      </div>

    );
  }
}

// EditorApp;
export default function EditorFn(props) {
  return (
    <div className="mindmap-container" id="mindmap-container">
      <EditorApp {...props} />
    </div >
  );
}
