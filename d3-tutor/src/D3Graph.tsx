import React, {Component} from 'react'
import {select, mouse, selectAll} from 'd3-selection'
import {forceCenter, forceLink, forceManyBody, forceSimulation, forceLayout} from 'd3-force'
import data from './data.json'
import {scaleOrdinal} from "d3-scale";
import {schemeCategory10} from "d3-scale-chromatic"

import Dock from 'react-dock'

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

    resetDragLine() {
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
            this.resetDragLine();
            return;
        }
        let newLink;
        if (this.state.mouseup_node && this.state.mousedownNode)
        {
            newLink = {source: this.state.mousedownNode, target: this.state.mouseup_node};
        }
        else if (this.state.mousedownNode)
        {
            this.addNode('example', mouse(this.svg.node())[0], mouse(this.svg.node())[1])
            newLink = {source: this.state.mousedownNode, target: this.length}
        }

        this.container
            .select('.links')
            .append('path')
            .attr('class', 'link')

        let newGraph = {
            'nodes': this.state.graph.nodes,
            'links': [...this.state.graph.links,
                newLink]}

        this.setState({graph: newGraph}, this.updateGraph);
        this.resetDragLine();
    }

    initializeGraph() {
        this.graph = forceSimulation(this.state.graph.nodes)
            .force('link', forceLink(this.state.graph.links).id((d:any) => d.id).distance(150))
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
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.state.graph.nodes)
            .enter()
            .append('g')
            .attr('id', (d:any) => `id${d.id}`)

        this.node
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d:any) => {
                return Math.pow(d.label.length, 0.5) * 10;
            })
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

        this.node
            .append('text')
            .text((d:any) => {return d.label})
            .attr('dy', '.20em')
            .style('text-anchor', 'middle')
            .style('font-size', (d:any) => {
                let r = Math.pow(d.label.length, 0.5) * 10;
                return (3.3 * r / d.label.length)
            })
            .style("fill", "white")

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
        this.node = this.container
            .select('.nodes')
            .selectAll('g')
            .data(this.state.graph.nodes)

        this.link = this.container
            .selectAll('.links')
            .selectAll('.link')
            .data(this.state.graph.links)

        this.graph.nodes(this.state.graph.nodes)
        this.graph.force('link').links(this.state.graph.links)
        this.graph.force('charge', forceManyBody().strength(-200))
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
        this.graph.alpha(0.1).restart()
    }

    addNode = (content:string, x:number, y:number) => {
        let newData = {
            id: `${++this.length}`,
            label: content,
            x: x, y: y
        }

        let newGraph = {
            'nodes': [...this.state.graph.nodes, newData],
            'links': this.state.graph.links
        }

        let newNode = this.container
            .select('.nodes')
            .append('g')
            .attr('id', `id${this.length}`)

        newNode
            .selectAll('g')
            .data([newData])
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d:any) => {
                return Math.pow(d.label.length, 0.5) * 10;
            })
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

        newNode
            .append('text')
            .text(content)
            .attr('dy', '.20em')
            .style('text-anchor', 'middle')
            .style('font-size', (d:any) => {
                let r = Math.pow(content.length, 0.5) * 10;
                return (3 * r / content.length)
            })
            .style("fill", "white")

        this.setState({graph: newGraph}, this.updateGraph)
    }

    deleteNode() {
        let newNodes = this.state.graph.nodes
        newNodes.splice(this.state.graph.nodes.indexOf(this.state.currentNode), 1)

        let newLinks = this.state.graph.links
        this.container.select('.links').selectAll('.link').filter((d:any) => {
            if (d.target.id == this.state.currentNode.id || d.source.id == this.state.currentNode.id)
            {
                newLinks.splice(newLinks.indexOf(d), 1)
                return true;
            }
            return false;
        }).remove()

        this.container.select('.nodes').select(`#id${this.state.currentNode.id}`).remove()

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
                <Dock position='left' isVisible={this.state.isVisible} dimMode='transparent'>
                    <button onClick={() => {this.setState({isVisible: false})}}>Exit</button>
                    <button onClick={() => {this.setState({isVisible: false}); this.deleteNode()}}>Delete Node</button>
                </Dock>
                <svg width={this.state.width} height={this.state.height} style={{border:'solid 1px #eee', borderBottom:'solid 1ox #ccc'}}>
                    <g className='graph'/>
                </svg>
            </div> )

    }
}
