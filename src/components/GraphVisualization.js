import React, { Component } from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './HomepageFeatures.module.css';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  var cytoscape = require('cytoscape');
  var euler = require('cytoscape-euler');
  // import cytoscape from 'cytoscape';
  // import euler from 'cytoscape-euler';
  // import coseBilkent from 'cytoscape-cose-bilkent';
  // import fcose from 'cytoscape-fcose';
  // import euler from 'cytoscape-euler';
}

const NodeState = {
  ALL: 1,
  HOVERED: 2,
  SELECTED: 3,
};
var nodeState = NodeState.ALL;

function init_graph() {
  cytoscape.use(euler);
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

function hideOthers(cy, target) {
  var sel = target;
  cy.elements().difference(sel.outgoers().union(sel.incomers())).not(sel).addClass('semitransp');
}
function showAll(cy) {
  cy.elements().removeClass('semitransp');
}

function registerEvents(cy) {
  /*
stateDiagram-v2
    [*] --> NodeAll
    NodeAll --> NodeHovered : mouseover
    NodeHovered --> NodeSelected : nodeclick
    NodeSelected --> NodeAll : panclick
    NodeHovered --> NodeAll : mouseout
    NodeSelected --> NodeAll : nodeclick
  */
  cy.on('mouseover', 'node', function (e) {
    if (nodeState == NodeState.ALL) {
      hideOthers(cy, e.target);
      nodeState = NodeState.HOVERED;
    }
  });

  cy.on('mouseout', 'node', function (e) {
    if (nodeState == NodeState.HOVERED) {
      showAll(cy);
      nodeState = NodeState.ALL;
    }
  });

  var previouslySelectedNodeId;
  var selectedNodeId;
  cy.on('click', 'node', function (e) {
    previouslySelectedNodeId = selectedNodeId;
    selectedNodeId = e.target.id();
    if (nodeState == NodeState.HOVERED || nodeState == NodeState.ALL) {
      hideOthers(cy, e.target);
      nodeState = NodeState.SELECTED;
    }
    else if (nodeState == NodeState.SELECTED) {
      if (previouslySelectedNodeId == selectedNodeId) {
        showAll(cy);
        nodeState = NodeState.ALL;
      }
      else {
        showAll(cy);
        hideOthers(cy, e.target);
        nodeState = NodeState.SELECTED;
      }
    }

  });
  cy.on('tap', function (e) {
    if (e.target === cy) {
      console.log('tap on background');
      showAll(cy);
      nodeState = NodeState.ALL;
    }
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

  document.addEventListener("keypress", function (e) {
    showAll(cy);
    nodeState = NodeState.ALL;
  });
}

function show_graph(graph) {

  var cy = init_graph();
  setStyle(cy);
  registerEvents(cy);

  cy.json(graph);

  var layout = cy.layout({
    name: 'euler',
    randomize: true,
    nodeDimensionsIncludeLabels: true,
    animate: false,
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
            <div id="cy" tabIndex="0" style={{ width: "100%", height: "900px" }} ></div>
          </div>
        </div>
      </section >
    );
  }
}

// https://dev.to/christo_pr/render-dangerous-content-with-react-2j7j
// https://github.com/facebook/Docusaurus/blob/4553afda2bdb68db2f5f014a117cf93e81014037/lib/core/nav/SideNav.js#L36-L46
// export default function render({ graph }) {
//   return (
//     <section className={styles.features}>
//       <BrowserOnly>
//         {() => {
//           <div className="main-wrapper">
//             <div className="row" >
//               <div>Hello</div>
//               <div id="cy" tabIndex="0" style={{ width: "100%", height: "900px" }} ></div>
//             </div>
//             <script
//               dangerouslySetInnerHTML={{ __html: show_graph(graph) }}
//             />
//           </div>;
//         }}
//       </BrowserOnly>
//     </section >
//   );
// }
