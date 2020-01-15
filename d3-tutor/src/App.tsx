import React, {Component} from 'react'
import Graph from './Graph'
import D3Graph from "./D3Graph"
import data from './data.json'
import {GraphPropsType} from "./types"
import ButtonAppBar from "./NavPanel"

export default class App extends Component<any, GraphPropsType> {
    state = {
        width: 1000,
        height: 500,
        id: 'root'
    }

    render() {
        return (
            <div className="App">
                <ButtonAppBar/>
                <D3Graph/>
            </div>
        )
    }
}
