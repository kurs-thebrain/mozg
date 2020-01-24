import React, {Component, useState} from 'react'
import {select, mouse, selectAll} from 'd3-selection'
import {forceCenter, forceLink, forceManyBody, forceSimulation, forceLayout} from 'd3-force'
import data from './data.json'
import {scaleOrdinal} from "d3-scale";
import {schemeCategory10} from "d3-scale-chromatic"

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'

import Note from './Note'

// РАЗДЕЛИТЬ НА НЕСКОЛЬКО ФАЙЛОВ УЖЕ НЕ СМЕШНО

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

    length = 0;
    graph = forceSimulation();
    svg = selectAll;
    container = selectAll;
    node = selectAll;
    nodes = [{}];
    link = selectAll;
    drag_line = selectAll;
    colorScale = scaleOrdinal(schemeCategory10);

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
        let newLink;
        if (this.state.mouseup_node && this.state.mousedownNode)
        {
            newLink = {source: this.state.mousedownNode, target: this.state.mouseup_node};
        }
        else if (this.state.mousedownNode)
        {
            this.addNode('kekw', mouse(this.svg.node())[0], mouse(this.svg.node())[1])
            newLink = {source: this.state.mousedownNode, target: this.length}
        }

        this.container
            .selectAll('.links')
            .append('path')
            .attr('class', 'link')

        let newGraph = {
            'nodes': this.state.graph.nodes,
            'links': [...this.state.graph.links,
                newLink]}

        this.setState({graph: newGraph}, this.updateGraph);

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
            .selectAll('path')
            .data(this.state.graph.links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('source', (d:any) => `id${d.source.id}`)
            .attr('target', (d:any) => `id${d.target.id}`)

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
            .attr('id', (d:any) => `id${d.id}`)
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

        this.length = this.state.graph.nodes.length;
    }

    ticked = () => {
        this.node.call(this.updateNode)
        this.link.call(this.updateLink)
    }

    updateNode = (node:any) => {
        node.attr('transform', (d:any) => `translate(${this.fixna(d.x)},${this.fixna(d.y)})`)
    }

    updateLink = (link:any) => {
        link.attr('d', function(d:any) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });
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
                {   id: ++this.length,
                    contentType: 'markdown',
                    content: content,
                    x: x, y: y
                }],
            'links': this.state.graph.links
        }

        this.container
            .selectAll('.nodes')
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', (d:any) => this.colorScale(d))
            .attr('id', `id${this.length}`)
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

    deleteNode()
    {
        let newNodes = this.state.graph.nodes
        newNodes.splice(this.state.graph.nodes.indexOf(this.state.currentNode), 1)

        let newLinks = this.state.graph.links
        this.container.selectAll('.links').selectAll('.link').filter((d:any) => {
            if (d.target.id == this.state.currentNode.id || d.source.id == this.state.currentNode.id)
            {
                newLinks.splice(newLinks.indexOf(d), 1)
                return true;
            }
            return false;
        }).remove()
        this.container.selectAll('.nodes').select(`#id${this.state.currentNode.id}`).remove()

        let newGraph = {
            'nodes': newNodes,
            'links': newLinks
        }

        this.setState({graph: newGraph}, this.updateGraph)
        this.setState({isVisible: false})
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
                <SwipeableDrawer
                    onClose={(d:any) => {this.setState({isVisible:false})}}
                    onOpen={(d:any) => {this.setState({isVisible:true})}}
                    open={this.state.isVisible}
                    max-width='500'
                >
                    <Note
                        label = {this.state.currentNode.label}
                        markdown = {this.state.currentNode.content}
                        ///////////////////////////////////////////////////////////////////////////////////////////
                        setMarkdown = { (text:string) => {console.log(text)} } // !!!!! вот здесь изменение content
                        ///////////////////////////////////////////////////////////////////////////////////////////
                        deleteNode = {() => {this.setState({isVisible: false}); this.deleteNode()}}
                    />
                </SwipeableDrawer>
                <svg
                    width={this.state.width}
                    height={this.state.height}
                    style={{border:'solid 1px #eee',
                        borderBottom:'solid 1ox #ccc'}}
                >
                    <g className='graph'/>
                </svg>
            </div> )

    }
}
