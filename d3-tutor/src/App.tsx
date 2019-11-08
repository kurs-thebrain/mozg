import React, {Component} from 'react'
import Graph from './Graph'
import data from './data.json'
import {GraphPropsType} from "./types";

export default class App extends Component<any, GraphPropsType> {
    state = {
        data: data,
        width: 700,
        height: 500,
        id: 'root'
    }

    render() {
        return (
            <div className="App">
                <Graph data={this.state.data} width={this.state.width} height={this.state.height}/>
            </div>
        )
    }
}
