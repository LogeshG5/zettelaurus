import React, { Component } from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent);


function init_graph() {
  var cy = cytoscape({
    container: document.getElementById('cy'),
    // initial viewport state:
    zoom: 3,
    pan: { x: 0, y: 0 },
    wheelSensitivity: 0.3,
  });

  return cy;
}

function setStyle(cy) {

  cy.style().selector('node').style({
    'content': 'data(name)',
    'text-valign': 'center',
    'color': 'black',
    'font-size': '12px',
    'text-outline-width': 0,
    'text-outline-color': '#888',
    'background-color': '#ffdead',
    'background-opacity': '0.2',
    "width": "13px",
    "height": "13px",
    'text-valign': 'bottom',
    'text-halign': 'center'
  });
  cy.style().selector(':selected').style({
    'background-color': '#FFA500',
    'background-opacity': '0.5',
    'line-color': 'black',
    'target-arrow-color': 'black',
    'source-arrow-color': 'black',
    'text-outline-color': 'black',
    'width': '14px',
    'height': '14px'
  });

  cy.style().selector('edge').style({ 'width': 1, 'line-color': '#ffdead' }).update();

  cy.style().selector('node.highlight').style({ 'background-color': '#FFA500', }).update();
  cy.style().selector('node.semitransp').style({ 'opacity': '0.2' }).update();
  cy.style().selector('edge.highlight').style({ 'target-arrow-color': '#FFA500', 'line-color': '#ffdead', }).update();
  cy.style().selector('edge.semitransp').style({ 'opacity': '0.2' }).update();

}
function registerEvents(cy) {

  cy.on('mouseover', 'node', function (e) {
    var sel = e.target;
    cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
    sel.addClass('highlight').outgoers().addClass('highlight');
  });

  cy.on('mouseout', 'node', function (e) {
    var sel = e.target;
    cy.elements().removeClass('semitransp');
    sel.removeClass('highlight').outgoers().removeClass('highlight');
  });

  var tappedBefore;
  var tappedTimeout;
  cy.on('tap', function (event) {
    var tappedNow = event.target;
    if (tappedTimeout && tappedBefore) {
      clearTimeout(tappedTimeout);
    }
    if (tappedBefore === tappedNow) {
      tappedNow.trigger('doubleTap');
      tappedBefore = null;
    } else {
      tappedTimeout = setTimeout(function () { tappedBefore = null; }, 300);
      tappedBefore = tappedNow;
    }
  });

  cy.on('doubleTap', 'node', function () {
    try { // your browser may block popups
      if (this.selected() == true) {
        window.open(this.data('href'));
      }
    } catch (e) { // fall back on url change

    }
  });
}

function show_graph(graph) {
  var cy = init_graph();
  setStyle(cy);
  registerEvents(cy);

  cy.json(graph);

  var layout = cy.layout({
    name: 'cose-bilkent',
    nodeDimensionsIncludeLabels: true,
  });
  layout.run();
}


export default class GraphVisualization extends Component {

  constructor({ graph }) {
    super(graph)
    this.graph = graph
  }

  componentDidMount() {
    show_graph(this.graph);
  }

  render() {
    return (
      <section className={styles.features}>
        <div className="main-wrapper">
          <div className="row" >
            <div id="cy" style={{ width: "100%", height: "900px" }} ></div>
          </div>
        </div>
      </section >
    );
  }
}