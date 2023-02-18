import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
var Transformer = require('markmap-lib').Transformer;
var Markmap = require('markmap-view/dist/index.esm').Markmap;
var deriveOptions = require('markmap-view').deriveOptions;
console.log("canUseDOM");
// import './style.css';
const transformer = new Transformer();


class MindMap extends React.Component {
  constructor(props) {
    super(props);
    this.serverUrl = props.options.contentServer;
    this.path = this.parseFileDetails();
    this.value = "Loading...";
    this.loadContent(this.path.fullPath);
    this.refSvg = React.createRef(); // Ref for SVG element
    this.refMm = React.createRef(); // Ref for markmap object
  }

  componentDidMount() {
    setTimeout(() => document.title = "MindMap | " + this.path.fileName, 1000);
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
    return dict;
  }

  loadContent(path) {
    fetch(this.serverUrl + "/files/" + path)
      .then(response => response.text()) // Gets the response and returns it as a blob
      .then(blob => {
        this.value = blob;
        // console.log("value updated", this.value);
        const markmapOptions = deriveOptions({
          "initialExpandLevel": 2,
          "maxWidth": 300
        });
        this.refMm.current = Markmap.create(this.refSvg.current, markmapOptions);
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
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          return (
            <div height="100%">
              <svg height="100vh" width="100hh" ref={this.refSvg} />
            </div>
          )
        }}
      </BrowserOnly>
    );
  }
}

// MindMap;
export default function MindMapFn(props) {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        return (
          <div className="mindmap-container" id="mindmap-container">
            <MindMap {...props} />
          </div >
        )
      }}
    </BrowserOnly>
  );
}
