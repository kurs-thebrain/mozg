import React, {Component} from 'react'
import {select, selectAll, event} from 'd3-selection'
import {forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY} from 'd3-force'
import {drag} from 'd3-drag'
import data from './data.json'

export default class D3Graph extends Component<any,any> {
    constructor(props:any) {
        super(props)
        this.state = {
            graph: data,
            width: 1000,
            height: 600
        }
    }

    draw() {


        const graphLayout = forceSimulation(this.state.graph.nodes)
            .force('charge', forceManyBody().strength(-2000))
            .force('center', forceCenter(this.state.width/2, this.state.height/2))
            .force('x', forceX(this.state.width/2).strength(1))
            .force('y', forceY(this.state.height/2).strength(1))
            .force('link', forceLink(this.state.graph.links).id((d:any) => d.id).distance(500).strength(1))
            .on('tick', ticked)

        const svg = select('#root')
            .append('svg')
            .attr('width', this.state.width)
            .attr('height', this.state.height)

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
            .attr('r', 20)
            .attr('fill', 'red')

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

    render() {
        this.draw()
        return <div></div>
    }
}
