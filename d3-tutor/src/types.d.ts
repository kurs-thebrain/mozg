export type GraphPropsType = {
    data: Graph,
    width?: number,
    height?: number,
    id?: string
}

export type Node = {
    id: number,
    label?: string,
    group?: number
}

export type Link = {
    source: number,
    target: number,
    value: number
}

export type Graph = {
    nodes: Node[]
    links: Link[]
}
