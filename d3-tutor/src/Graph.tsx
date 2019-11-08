import React, {Component} from 'react'
import {} from 'd3-force'
import {select, selectAll, event} from 'd3-selection'
import {forceSimulation, forceLink, forceManyBody, forceCenter} from 'd3-force'
import {scaleOrdinal, schemeCategory20} from 'd3-scale'
import {json} from 'd3-request'
import {drag} from 'd3-drag'

export default class Graph extends Component<any,any> {
    constructor(props:any){
        super(props)
        this.state = {
            graph: this.props.data
        }
    }

    componentDidMount(): void {
        // const state = this.state.props.data
        // this.setState({graph: state})
        this.draw()
    }

    draw() {
        const svg = select("body")
            .append("svg")
            .attr('width', this.props.width)
            .attr('height', this.props.height)

        const simulation = forceSimulation()
            .force('link', forceLink().id((d:any)=>d.id))
            .force('charge', forceManyBody())
            .force('center', forceCenter(this.props.width/2, this.props.height/2))

        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('g')
            .data(this.state.graph.links)
            .enter()
            .append('line')
            .attr('stroke-width', (d:any) => Math.sqrt(d.value))

        const node = svg.selectAll('g')
            .data(this.state.graph.nodes)
            .enter()
                .append('g')

        console.log(this.state.graph)

        const circles = node.selectAll('circle')
            .data(this.state.graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('x', (d:any, i:any) => i*100)
            .attr('y', 0)
            .attr('fill', 'green')
            .call(drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        // const circles = selectAll('g')
        //     .append('circle')
        //     .attr('r', 5)
        //     .attr('fill', 'green')

        simulation
            .nodes(this.state.graph.nodes)
            .on('tick', ticked)

        // simulation
        //     .force(link)
        //     .links(this.state.graph.links) не работает

        // simulation
        //     //.force(link)
        //     .links(this.state.graph.links)

        function ticked() {
            link
                .attr('x1', (d:any) => d.source.x)
                .attr('y1', (d:any) => d.source.y)
                .attr('x2', (d:any) => d.target.x)
                .attr('y2', (d:any) => d.target.y)
            node
                .attr('transform', (d:any) => `translate(${d.x},${d.y})`)
        }

        function dragstarted(d:any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(d:any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }


    render() {
        return (
            <div id={"graph"}/>
        )
    }
}
