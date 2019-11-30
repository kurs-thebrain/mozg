import React, {Component} from 'react'
import {select, mouse, selectAll, event} from 'd3-selection'
import {forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY} from 'd3-force'
import {drag} from 'd3-drag'
import data from './data.json'
import {scaleOrdinal} from "d3-scale";
import {schemeCategory10} from "d3-scale-chromatic";

import Dock from 'react-dock'

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

    updateGraph() { // разделить это на initializeGraph и updateGraph? (вынести то, что должно выполниться 1 раз в другой метод)
        const graph = forceSimulation(this.state.graph.nodes)
            .force('link', forceLink(this.state.graph.links).id((d:any) => d.id).distance(75))
            .force('charge', forceManyBody().strength(-200))
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
            //.force('x', forceX(this.state.height/2).strength(0.1)) // вертикальное расположение
            .on('tick', ticked)

        const colorScale = scaleOrdinal(schemeCategory10) // работает не так, как нужно

        const mousedown = () => {
            this.setState({dragged: true})
            if (this.state.mousedownNode && this.state.dragged)
                drag_line
                    .attr("class", "drag_line")
                    .attr("x1", this.state.currentNode.x)
                    .attr("y1", this.state.currentNode.y)
                    .attr("x2", this.state.currentNode.x)
                    .attr("y2", this.state.currentNode.y);
        }

        const mousemove = () => {
            if (this.state.dragged)
                drag_line
                    .attr("x2", mouse(svg.node())[0])
                    .attr("y2", mouse(svg.node())[1]);
        }

        const mouseup = () => {
            if (this.state.dragged) {
                this.setState({dragged: false, mousedownNode: null})
                drag_line
                    .attr("class", "hidden_line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", 0)
            }
        }

        const svg = selectAll('svg')
            .on("mousemove", mousemove)
            .on("mousedown", mousedown)
            .on("mouseup", mouseup)

        const container = selectAll('g')

        const drag_line = container.append("line") // линия, которая отображается при создании новых узлов
            .attr("class", "hidden_line") // добавить в css кастомный класс
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)



        const link = container
            .append('g')
            .attr('class', 'links') // связи
            .selectAll('line')
            .data(this.state.graph.links)
            .enter()
            .append('line')
            .attr('class', 'link')


        const node = container
            .append('g')
            .attr('class', 'nodes') // узлы
            .selectAll('circle')
            .data(this.state.graph.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', (d:any) => colorScale(d))
            .on('mousedown', (d:any) => {
                this.setState({currentNode: d, mousedownNode: d})
            })
            .on('click', (d:any) => {
                this.setState({currentNode: d, isVisible: true})
            })

        const labels = node
            .append('text')
            .text((d:any) => d.label)
            .attr('x', (d:any) => d.x)
            .attr('y', (d:any) => d.y)

        node.append('title')
            .text((d:any) => d.label)

        function ticked() {
            node.call(updateNode)
            link.call(updateLink)
        }

        function updateNode(node:any) {
            node.attr('transform', (d:any) => `translate(${fixna(d.x)},${fixna(d.y)})`)
        }

        function updateLink(link:any) {
            link.attr('x1', (d:any) => fixna(d.source.x))
            link.attr('y1', (d:any) => fixna(d.source.y))
            link.attr('x2', (d:any) => fixna(d.target.x))
            link.attr('y2', (d:any) => fixna(d.target.y))
        }

        function fixna(x:any) {
            if (isFinite(x)) return x
            return 0
        }
    }


    handleWindowSize = () => {
        let updatedW = window.innerWidth,
            updatedH = window.innerHeight
        this.setState({width:updatedW, height:updatedH})

    }

    componentDidMount() {
        window.addEventListener('resize',this.handleWindowSize)
        this.updateGraph()
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.handleWindowSize)
    }

    render() {
        const toDraw = (this.state.currentNode.contentType === 'url') ? <iframe className='externalSite' src={this.state.currentNode.content} frameBorder="0"></iframe>
            : (this.state.currentNode.contentType === 'html') ? <p dangerouslySetInnerHTML={{__html: this.state.currentNode.content}}/> : 'empty'

        return (
            <div>
                <Dock position='left' isVisible={this.state.isVisible} dimMode='opaque'>
                    <button onClick={()=> {this.setState({isVisible: false})}}>Exit</button>
                    {toDraw}
                </Dock>
                <svg width={this.state.width} height={this.state.height} style={{border:'solid 1px #eee', borderBottom:'solid 1ox #ccc'}}>
                    <g className='graph'/>
                </svg>
            </div> )

    }
}
