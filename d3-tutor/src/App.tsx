import React, {Component} from 'react'
import Graph from './Graph'
import D3Graph from "./D3Graph";
import data from './data.json'
import {GraphPropsType} from "./types";

export default class App extends Component<any, GraphPropsType> {
    state = {
        width: 1000,
        height: 500,
        id: 'root'
    }

    render() {
        return (
            <div className="App">
                <D3Graph/>
            </div>
        )
    }
}
