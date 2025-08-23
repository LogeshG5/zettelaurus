import React, { Component } from "react";
import Layout from "@theme/Layout";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import FuzzySearch from "fuzzy-search";

if (ExecutionEnvironment.canUseDOM) {
  var cytoscape = require("cytoscape");
  var fcose = require("cytoscape-fcose");
  var layoutUtilities = require("cytoscape-layout-utilities");
}

class GraphUI {
  constructor() {
    cytoscape.use(fcose);
    cytoscape.use(layoutUtilities);
    this.layoutName = "fcose";

    this.cy = cytoscape({
      container: document.getElementById("cy"),
      zoom: 6,
      pan: { x: 0, y: 0 },
      // wheelSensitivity: 0.3, //mouse not behaving properly
    });

    this.style = this.cy.style();
  }

  getCy() {
    return this.cy;
  }

  setStyle() {
    this.style.selector("node").style({
      content: "data(name)",
      "text-valign": "center",
      color: "#2e8555",
      "font-size": "12px",
      "text-outline-width": 0,
      "text-outline-color": "#2e8555",
      "background-color": "#ffdead",
      "background-opacity": "0.3",
      width: "13px",
      height: "13px",
      "text-valign": "bottom",
      "text-halign": "center",
    });
    this.style.selector(":selected").style({
      "background-color": "#2e8555",
      "background-opacity": "0.7",
      width: "14px",
      height: "14px",
    });
    this.style
      .selector("node.highlight")
      .style({ "background-color": "#2e8555" })
      .update();
    this.style
      .selector("node.highlight-ring")
      .style({
        "background-color": "#2e8555",
        "border-width": "1",
        "border-color": "#2e8555",
      })
      .update();
    this.style
      .selector("node.highlight-preview")
      .style({ "background-color": "#2e8555" })
      .update();
    this.style.selector("node.semitransp").style({ opacity: "0.2" }).update();

    this.style
      .selector("edge")
      .style({ width: 1, "line-color": "#888", opacity: "0.7" })
      .update();
    this.style
      .selector("edge.highlight")
      .style({ "target-arrow-color": "#2e8555", "line-color": "#aaa" })
      .update();
    this.style.selector("edge.semitransp").style({ opacity: "0.2" }).update();
  }

  runLayout(graph) {
    this.cy.json(graph);

    var layout = this.cy.layout({
      name: this.layoutName,
      randomize: true,
      packComponents: true,
      nodeDimensionsIncludeLabels: true,
      animate: false,
    });
    layout.run();
  }

  fadeAll() {
    this.cy.elements().addClass("semitransp");
  }

  fadeOthers(ele) {
    this.cy
      .elements()
      .difference(ele.outgoers().union(ele.incomers()))
      .not(ele)
      .addClass("semitransp");
  }

  fade(ele) {
    ele.outgoers().addClass("semitransp");
  }

  showAll() {
    this.cy.elements().removeClass("semitransp");
    this.cy.elements().removeClass("highlight-ring");
  }

  hoverNode(ele) {
    this.fadeOthers(ele);
  }

  selectNode(ele) {
    this.showAll();
    this.cy.elements().removeClass("highlight-ring");
    this.fadeOthers(ele);
    ele.addClass("highlight-ring");
  }

  putNodeInCenter(ele) {
    this.cy.center(ele);
  }

  previewNode(ele) {
    this.cy.elements().removeClass("highlight-preview");
    ele.addClass("highlight-preview");
    ele.removeClass("semitransp");
    ele.outgoers().removeClass("semitransp");
  }

  fuzzyPreviewNode(ele) {
    this.cy.elements().removeClass("highlight-preview");
    ele.addClass("highlight-ring");
    ele.removeClass("semitransp");
  }

  showAllNodes() {
    this.showAll();
  }
}

const NodeState = {
  ALL: 1,
  HOVERED: 2,
  SELECTED: 3,
};

class GraphStateMachine {
  previouslySelectedNodeId;
  selectedNodeId;
  selectedNodeHistory = [];
  tappedBefore;
  tappedTimeout;
  focusedChildren = [];
  focusedChildIndex = 0;
  nodeState = NodeState.ALL;

  constructor(cy, ui) {
    this.cy = cy;
    this.ui = ui;
  }

  registerEvents() {
    this.cy.on("mouseover", "node", (ele) => this.mouseover(ele));
    this.cy.on("mouseout", "node", (ele) => this.mouseout(ele));
    this.cy.on("click", "node", (ele) => this.click(ele));
    this.cy.on("tap", (ele) => this.tapBackground(ele));
    this.cy.on("tap", (ele) => this.tap(ele));
    this.cy.on("doubletap", (ele) => this.doubletap(ele));
    document.addEventListener("keydown", (key) => this.keydown(key));
    document
      .getElementById("nodeSearch")
      .addEventListener("input", (key) => this.nodeSearchChanged(key));
  }

  selectNode(ele) {
    this.ui.selectNode(ele);
    this.selectedNodeHistory.push(ele);
    this.nodeState = NodeState.SELECTED;
    // populate children
    this.focusedChildren = ele.outgoers((ele) => ele.isNode());
    this.focusedChildIndex = 0;
  }

  showAllNodes() {
    this.ui.showAllNodes();
    this.nodeState = NodeState.ALL;
  }

  hoverNode(ele) {
    this.ui.hoverNode(ele);
    this.nodeState = NodeState.HOVERED;
  }

  incIndex(index) {
    return (index + 1) % this.focusedChildren.length;
  }

  decIndex(index) {
    return index == 0 ? this.focusedChildren.length - 1 : index - 1;
  }

  incFocusedIndex() {
    this.focusedChildIndex =
      (this.focusedChildIndex + 1) % this.focusedChildren.length;
  }

  decFocusedIndex() {
    this.focusedChildIndex =
      this.focusedChildIndex == 0
        ? this.focusedChildren.length - 1
        : this.focusedChildIndex - 1;
  }

  previewNext() {
    if (this.focusedChildren.length == 0) {
      return;
    } else if (this.focusedChildren.length == 1) {
      this.ui.previewNode(this.focusedChildren[0]);
      return;
    }
    const index = this.focusedChildIndex % this.focusedChildren.length;
    const prev_index = index == 0 ? this.focusedChildren.length - 1 : index - 1;
    this.ui.fade(this.focusedChildren[prev_index]);
    this.ui.previewNode(this.focusedChildren[index]);
    this.focusedChildIndex = this.incIndex(this.focusedChildIndex);
  }

  previewPrev() {
    if (this.focusedChildren.length == 0) {
      return;
    } else if (this.focusedChildren.length == 1) {
      this.ui.previewNode(this.focusedChildren[0]);
      return;
    }
    this.focusedChildIndex = this.decIndex(this.focusedChildIndex);
    const prev_index = this.focusedChildIndex % this.focusedChildren.length;
    const index =
      this.focusedChildIndex == 0
        ? this.focusedChildren.length - 1
        : this.focusedChildIndex - 1;
    this.ui.fade(this.focusedChildren[prev_index]);
    this.ui.previewNode(this.focusedChildren[index]);
  }

  selectNext() {
    if (this.focusedChildren.length == 0) {
      return;
    }
    const index = this.decIndex(this.focusedChildIndex);
    var ele = this.focusedChildren[index];
    this.selectNode(this.focusedChildren[index]);
    this.ui.putNodeInCenter(ele);
  }

  selectPrev() {
    if (this.selectedNodeHistory.length < 2) return;
    var ele = this.selectedNodeHistory.pop();
    this.selectNode(this.selectedNodeHistory.pop());
    this.ui.putNodeInCenter(ele);
  }

  getUrl(nodeLink) {
    const siteUrl = window.location.href.replace("graph", "");
    let url = siteUrl + nodeLink;
    url = url.replace(/(?<!:)\/{2,}/g, '/');
    return url;
  }

  openUrl() {
    if (this.selectedNodeHistory.length < 1) return;
    this.doubletap(
      this.selectedNodeHistory[this.selectedNodeHistory.length - 1]
    );
    const nodeLink = this.selectedNodeHistory[this.selectedNodeHistory.length - 1].data("href")
    window.open(this.getUrl(nodeLink));
  }

  /* Callbacks */

  mouseover(ele) {
    if (this.nodeState == NodeState.ALL) {
      this.hoverNode(ele.target);
    }
  }

  mouseout(ele) {
    if (this.nodeState == NodeState.HOVERED) {
      this.showAllNodes();
    }
  }

  click(e) {
    this.previouslySelectedNodeId = this.selectedNodeId;
    this.selectedNodeId = e.target.id();

    if (
      this.nodeState == NodeState.HOVERED ||
      this.nodeState == NodeState.ALL
    ) {
      this.selectNode(e.target);
    } else if (this.nodeState == NodeState.SELECTED) {
      if (this.previouslySelectedNodeId == this.selectedNodeId) {
        this.showAllNodes();
      } else {
        this.showAllNodes();
        this.selectNode(e.target);
      }
    }
  }

  tapBackground(e) {
    // tapped on background
    if (e.target === this.cy) {
      this.showAllNodes();
    }
  }

  tap(ele) {
    var tappedNow = ele.target;
    if (this.tappedTimeout && this.tappedBefore) {
      clearTimeout(this.tappedTimeout);
    }
    if (this.tappedBefore === tappedNow) {
      tappedNow.trigger("doubletap", [ele.target]);
      this.tappedBefore = null;
    } else {
      this.tappedTimeout = setTimeout(() => {
        this.tappedBefore = null;
      }, 300);
      this.tappedBefore = tappedNow;
    }
  }

  doubletap(ele) {
    try {
      // your browser may block popups
      if (ele.target.selected() == true) {
        window.open(this.getUrl(ele.target.data("href")));
      }
    } catch (e) {
      // fall back on url change
    }
  }

  keypress(key) { }

  keydown(key) {
    if (document.activeElement.id == "nodeSearch") return;

    if (key.key == "/") {
      key.preventDefault();
      document.getElementById("nodeSearch").focus();
      return;
    } else if (key.key == "j" || key.key == "ArrowLeft") {
      this.previewNext();
    } else if (key.key == "k" || key.key == "ArrowRight") {
      this.previewPrev();
    } else if (key.key == "h" || key.key == "ArrowUp") {
      this.selectPrev();
    } else if (key.key == "l" || key.key == "ArrowDown") {
      this.selectNext();
    } else if (key.key == "o" || key.key == "Enter") {
      this.openUrl();
    }
  }

  nodeSearchChanged(e) {
    const text = e.target.value;
    if (text.length < 3) return;
    var fuzzy = new FuzzySearch(this.cy.json().elements.nodes, ["data.name"], {
      caseSensitive: false,
    });
    var result = fuzzy.search(text);
    this.ui.fadeAll();
    result.forEach((ele) => {
      this.ui.fuzzyPreviewNode(this.cy.$("#" + ele.data.id));
    });
  }
}

function showGraph(graphData) {
  const ui = new GraphUI();
  ui.setStyle();

  var cy = ui.getCy();

  const sm = new GraphStateMachine(cy, ui);
  sm.registerEvents();

  ui.runLayout(graphData);
}

function GraphLayout() {
  return (
    <section>
      <div
        id="cy"
        tabIndex="0"
        style={{ width: "100%", height: "900px" }}
      ></div>
    </section>
  );
}

export default class GraphVisualization extends Component {
  constructor({ graph }) {
    super(graph);
    this.graphData = graph;
  }

  componentDidMount() {
    showGraph(this.graphData);
  }

  render() {
    return (
      <Layout title="Graph">
        <div>
          <input type="search" id="nodeSearch" name="nodeSearch" />
        </div>
        <GraphLayout />
      </Layout>
    );
  }
}
