import React, {Component} from 'react'
import {select, selectAll, event} from 'd3-selection'
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
            graph: data,
            isVisible: false,
            currentNode: {},
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    draw() {
        const graphLayout = forceSimulation(this.state.graph.nodes)
            .force('link', forceLink(this.state.graph.links).id((d:any) => d.id))
            .force('charge', forceManyBody())
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
            //.force('x', forceX(this.state.height/2).strength(0.1)) // вертикальное расположение

            .on('tick', ticked)

        const colorScale = scaleOrdinal(schemeCategory10)

        const svg = select('svg')

        const container = svg.append('g')

        const link = container.attr('class', 'links')
            .selectAll('line')
            .data(this.state.graph.links)
            .enter()
            .append('line')
            .attr('stroke', '#aaa')
            .attr('stroke-width', '1px')

        const node = container.attr('class', 'nodes')
            .selectAll('circle')
            .data(this.state.graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', (d:any) => colorScale(d))

        const labels = node.attr('class', 'labels')
            .append('text')
            .text((d:any) => d.label)
            .attr('x', (d:any) => d.x)
            .attr('y', (d:any) => d.y)

        node.append('title')
            .text((d:any) => d.label)

        node.on('click',  (d:any) => {
            this.setState({currentNode: d, isVisible: true})
        })

        node.call(
            drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
        )

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

        function dragstarted(d:any) {
            if (!event.active) graphLayout.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(d:any) {
            if (!event.active) graphLayout.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    componentDidMount(): void {
        this.draw()
    }

    render() {

        const toDraw = (this.state.currentNode.contentType === 'url') ? <iframe className='externalSite' src={this.state.currentNode.content} frameBorder="0"></iframe>
            : (this.state.currentNode.contentType === 'html') ? <div>{this.state.currentNode.content}</div> : 'wtf'

        return (
        <div>
            <Dock position='left' isVisible={this.state.isVisible} dimMode='opaque'>
                {toDraw}
            </Dock>
            <svg width={this.state.width} height={this.state.height} style={{border:'solid 1px #eee', borderBottom:'solid 1ox #ccc'}}/>
        </div> )

    }
}
