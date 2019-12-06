export type GraphPropsType = {
    data?: Graph,
    width?: number,
    height?: number,
    id?: string
}

export type Node = {
    id?: number|string,
    label?: string,
    group?: number,
    content?: string,
    contentType?: string
}

export type Link = {
    source: number,
    target: number,
    value: number
}

export type Graph = {
    nodes?: Node[]
    links?: Link[]
}

export type GraphState = {
    graph: Graph,
    currentNode: Node,
    width: number,
    height: number,

    isVisible: boolean,

    dragged: any,
    mousedownLink: any,
    mousedownNode: any,
    mouseup_node: any,
}
