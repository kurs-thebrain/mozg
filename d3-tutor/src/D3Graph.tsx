import React, {Component, useState} from 'react'
import {mouse, selectAll} from 'd3-selection'
import {forceCenter, forceLink, forceManyBody, forceSimulation, forceLayout} from 'd3-force'
import data from './data.json'
import {scaleOrdinal} from "d3-scale";
import {schemeCategory10} from "d3-scale-chromatic"

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
//import MarkdownEditor from './md_editor'

import EditorPreview from './EditorPreview'

// РАЗДЕЛИТЬ НА НЕСКОЛЬКО ФАЙЛОВ УЖЕ НЕ СМЕШНО

import ButtonAppBar from "./NavPanel";
// связи между "братьями" сделать пунктирными

export default class D3Graph extends Component<any,any> {
    constructor(props:any) {
        super(props)
        this.state = {
            //data
            graph: data,
            currentNode: {},

            //window properties
            width: window.innerWidth,
            height: window.innerHeight,

            // Dock component's variable
            isVisible: false,

            //mouse behaviour variables
            dragged: null,
            mousedownLink: null,
            mousedownNode: null,
            mouseup_node: null,
        }
    }

    graph = forceSimulation();
    svg = selectAll;
    container = selectAll;
    node = selectAll;
    nodes = [{}];
    link = selectAll;
    drag_line = selectAll;
    colorScale = scaleOrdinal(schemeCategory10)

    mousedown = () => {
        this.setState({dragged: true})
        if (this.state.mousedownNode && this.state.dragged)
            this.drag_line
                .attr("class", "drag_line")
                .attr("x1", this.state.currentNode.x)
                .attr("y1", this.state.currentNode.y)
                .attr("x2", this.state.currentNode.x)
                .attr("y2", this.state.currentNode.y);
    }

    mousemove = () => {
        if (this.state.dragged)
            this.drag_line
                .attr("x2", mouse(this.svg.node())[0])
                .attr("y2", mouse(this.svg.node())[1]);
    }

    mouseup = () => {
        if (this.state.mouseup_node == this.state.mousedownNode)
        {
            if (this.state.dragged) {
                this.setState({dragged: false, mousedownNode: null, mouseup_node: null})
                this.drag_line
                    .attr("class", "hidden_line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", 0)
            }
            return;
        }

        if (this.state.mouseup_node && this.state.mousedownNode)
        {
            let newLink = {source: this.state.mousedownNode, target: this.state.mouseup_node};
            this.container
                .selectAll('.links')
                .append('path')
                .attr('class', 'link')

            this.state.graph.links.push(newLink)
            this.updateGraph()
        }
        else if (this.state.mousedownNode)
        {
            this.addNode('kekw', mouse(this.svg.node())[0], mouse(this.svg.node())[1])

            let newLink = {source: this.state.mousedownNode, target: this.state.graph.nodes.length}

            this.container
                .selectAll('.links')
                .append('path')
                .attr('class', 'link')

            this.state.graph.links.push(newLink)

            this.updateGraph();
        }

        if (this.state.dragged) {
            this.setState({dragged: false, mousedownNode: null, mouseup_node: null})
            this.drag_line
                .attr("class", "hidden_line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0)
        }
    }

    initializeGraph() {
        this.graph = forceSimulation(this.state.graph.nodes)
            .force('link', forceLink(this.state.graph.links).id((d:any) => d.id).distance(75))
            .force('charge', forceManyBody().strength(-200))
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
            .on('tick', this.ticked)

        this.container = selectAll('g')

        this.drag_line = this.container.append("line") // линия, которая отображается при создании новых узлов
            .attr("class", "hidden_line") // добавить в css кастомный класс
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)

        this.link = this.container.append('g')
            .attr('class', 'links') // связи
            .selectAll('line')
            .data(this.state.graph.links)
            .enter()
            .append('path')
            .attr('class', 'link')

        this.node = this.container
            .append('g')
            .attr('class', 'nodes') // узлы
            .selectAll('circle')
            .data(this.state.graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', (d:any) => this.colorScale(d))
            .on('mousedown', (d:any) => {
                this.setState({currentNode: d, mousedownNode: d})
                this.setState({markdown: d.content})
            })
            .on('mouseup', (d:any)=>
            {
                this.setState({currentNode: d, mouseup_node: d})
            })
            .on('click', (d:any) => {
                this.setState({currentNode: d, isVisible: true})
            })

        this.svg = selectAll('svg')
            .on("mousemove", this.mousemove)
            .on("mousedown", this.mousedown)
            .on("mouseup", this.mouseup)
    }

    ticked = () => {
        this.node.call(this.updateNode)
        this.link.call(this.updateLink)
    }

    updateNode = (node:any) => {
        node.attr('transform', (d:any) => `translate(${this.fixna(d.x)},${this.fixna(d.y)})`)
    }

    updateLink = (link:any) => {
        // link.attr('x1', (d:any) => this.fixna(d.source.x))
        // link.attr('y1', (d:any) => this.fixna(d.source.y))
        // link.attr('x2', (d:any) => this.fixna(d.target.x))
        // link.attr('y2', (d:any) => this.fixna(d.target.y))

        link.attr('d', function(d:any){
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        })
    }

    fixna = (x:any) => {
        if (isFinite(x)) return x
        return 0
    }

    updateGraph() {
        this.node = this.container.selectAll('.nodes').selectAll('.node').data(this.state.graph.nodes)
        this.link = this.container.selectAll('.links').selectAll('.link').data(this.state.graph.links)

        this.graph.nodes(this.state.graph.nodes)
        this.graph.force('link').links(this.state.graph.links)
        this.graph.force('charge', forceManyBody().strength(-200))
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
        this.graph.alpha(0.1).restart()
    }

    addNode = (content:string, x:number, y:number) => {
        let newGraph = {
            'nodes': [...this.state.graph.nodes,
                {   id: this.state.graph.nodes.length + 1,
                    contentType: 'markdown',
                    content: content,
                    x: x,
                    y: y
                }],
            'links': this.state.graph.links
        }

        this.container
            .selectAll('.nodes')
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', (d:any) => this.colorScale(d))
            .on('mousedown', (d:any) => {
                this.setState({currentNode: d, mousedownNode: d})
            })
            .on('mouseup', (d:any)=>
            {
                this.setState({currentNode: d, mouseup_node: d})
            })
            .on('click', (d:any) => {
                this.setState({currentNode: d, isVisible: true})
            })

        this.setState({graph: newGraph}, this.updateGraph)
    }

    handleWindowSize = () => {
        let updatedW = window.innerWidth,
            updatedH = window.innerHeight
        this.setState({width:updatedW, height:updatedH})

    }

    componentDidMount() {
        window.addEventListener('resize',this.handleWindowSize)
        this.initializeGraph()
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.handleWindowSize)
    }

    render() {
        return (
            <div>
                <ButtonAppBar/>
                <SwipeableDrawer
                    onClose={(d:any) => {this.setState({isVisible:false})}}
                    onOpen={(d:any) => {this.setState({isVisible:true})}}
                    open={this.state.isVisible}
                    max-width='500'
                    >
                    <EditorPreview markdown = {this.state.currentNode.content}/>
                </SwipeableDrawer>
                <svg width={this.state.width} height={this.state.height} style={{border:'solid 1px #eee', borderBottom:'solid 1ox #ccc'}}>
                    <g className='graph'/>
                </svg>
            </div> )

    }
}
