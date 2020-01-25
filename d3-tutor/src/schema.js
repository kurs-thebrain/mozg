var neo4j = require('neo4j-driver');

//возвращает драйвер подключения к neo4j
function GetNeo4jDriver(){
    return neo4j.driver(
        'bolt://localhost:7687', 
        neo4j.auth.basic('neo4j','pass'),
        { disableLosslessIntegers: true }
    );
}

//Типы данных---------------------------
class LinkType{
    constructor(source, target){
        this.source = source
        this.target = target
    }
}

export class NodeType{
    constructor(id,label,content){
        this.id = id;
        this.label = label;
        this.content = content;
    }
};

export class ChildrenType{
    constructor(links,nodes){
        this.nodes = nodes;
        this.links = links;
    }
};
//--------------------------------------

//--------------------------------------
//узнает, связаны ли два узла
async function AreNodesConnection(idFirst,idSecond){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 'MATCH (a:Node{id:{IDFIRST}})-[r]->'+
    '(b:Node{id:{IDSECOND}}) RETURN CASE WHEN r IS '+
    'NULL THEN false ELSE true END AS c';
    let params = {IDFIRST:idFirst,IDSECOND:idSecond};
    const result_1 = await session.run(query, params);
    session.close();
    if (result_1.records[0])
        return true;
    else
        return false;
}

//возвращает json-объект со списком связей
function GetLinksList(result){
    let links = [];
    if (result.length === 0) return {links:[]}
    let sourceId = result.records[0].get(0).properties.id
    result.records.forEach(nodeRecord => {
        let properties = nodeRecord.get(1).properties;
        links.push(new LinkType(
            sourceId,
            properties.id
        ));
    });
    console.log("links")
    console.log(links)
    return links;
}

//возвращает json-объект со списком узлов
function GetNodesList(result){
    let nodes = [];
    if (result.length === 0) return {nodes:[]}
    let properties = result.records[0].get(0).properties
    nodes.push(new NodeType(
        properties.id,
        properties.label,
        properties.content,
    ))
    result.records.forEach(nodeRecord => {
        properties = nodeRecord.get(1).properties;
        nodes.push(new NodeType(
            properties.id,
            properties.label,
            properties.content,
        ));
    });
    return nodes;
}
//-----------------------------------

let _id = 1;

//Мутации----------------------------
export async function CreateNode(label,content){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 
    `CREATE (n:NodeType{
        label:{LABEL},
        content:{CONTENT}
    }) 
    SET n={id:ID(n),label:n.label,
        content:n.content}
    RETURN n`;
    let params = {LABEL:label,CONTENT:content};
    await session
        .run(query,params)
        .then(r=>{
            r.records.forEach(record => {
                console.log(r)
                newId = record.get(0).properties.id
            })
        })
    await session.close()
    await driver.close()
    //const result_1 = await promise;
    // const singleRecord = result_1.records[0];
    // let nodeRecord = singleRecord.get(0).properties;
    // ++_id;
    // return new NodeType(nodeRecord.id, nodeRecord.label, nodeRecord.content);
}

let newId

export const getNewId = () => {
    return newId
}

export async function CreateChildNode(parentId,label,content){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 
    `MATCH (b:NodeType) WHERE ID(b) = ${parentId}
    CREATE (a:NodeType{
        label:{LABEL}, 
        content:{CONTENT}
    })<-[r1:RELATION]-(b) CREATE (a)-[r2:RELATION]->(b) 
    SET a={id:ID(a),label:a.label,
    content:a.content}
    RETURN a`
    let params = {PARENTID:parentId,LABEL:label,CONTENT:content};
    await session.run(query,params)
        .then(r=>{
            r.records.forEach(record => {
                newId = record.get(0).properties.id})
        })
    await session.close()
    await driver.close()
    //session.close()
    // const singleRecord = result_1.records[0];
    // let nodeRecord = singleRecord.get(0).properties;
    // return new NodeType(nodeRecord.id, nodeRecord.label, nodeRecord.content);
}

export async function ConnectNodes(idFirst,idSecond){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (a:NodeType{id:{IDFIRST}}),(b:NodeType{id:{IDSECOND}}) '+
        'CREATE (a)<-[r1:RELATION]-(b)<-[r2:RELATION]-(a)';
        let params = {IDFIRST:idFirst,IDSECOND:idSecond};
        const result_1 = session.run(query, params);
    session.close();
    if (result_1)
        return true;
    else
        return false;
}

export async function DeleteAll(){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n) DETACH DELETE n';
        const result_1 = await session.run(query);
    session.close();
    if (result_1)
        return true;
    else
        return false;
}

export async function DeleteNode(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}})-[r]-() DELETE n,r';
        let params = {ID:id};
        const result_1 = await session.run(query, params);
    session.close();
    if (result_1)
        return true;
    else
        return false;
}

export async function DeleteConnection(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}})-[r]-() DELETE r';
        let params = {ID:id};
        const result_1 = await session.run(query, params);
    session.close();
    if (result_1)
        return true;
    else
        return false;
}

export async function ChangeNodeLabel(id,newLabel){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
        'label:{LABEL}';
        let params = {ID:id,LABEL:newLabel};
        const promise = session.run(query,params);
        const result_1 = await promise;
    session.close();
    const singleRecord = result_1.records[0];
    let nodeRecord = singleRecord.get(0).properties;
    return new NodeType(nodeRecord.id, nodeRecord.label, nodeRecord.content);
}

export async function ChangeNodeContent(id,newContent){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
        'content:{CONTENT}';
        let params = {ID:id,LABEL:newContent};
        const promise = session.run(query,params);
        const result_1 = await promise;
    session.close();
    const singleRecord = result_1.records[0];
    let nodeRecord = singleRecord.get(0).properties;
    return new NodeType(nodeRecord.id, nodeRecord.label, nodeRecord.content);
}
//-----------------------------------

//Запросы----------------------------
export async function FindNode(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) RETURN n';
        let params = {ID:id};
        const promise = session.run(query,params);
        const result_1 = await promise;
    session.close();
    const singleRecord = result_1.records[0];
    let nodeRecord = singleRecord.get(0).properties;
    return new NodeType(nodeRecord.id, nodeRecord.label, nodeRecord.content);
}

export async function FindChildren(id){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 'MATCH (a:NodeType{id:{ID}})-[r:RELATION]->(b) RETURN a, b';
    let params = {ID:id};
    const result_1 = await session.run(query, params);
await session.close();
console.log(result_1.records)
if (result_1.records.length === 0) {
    return {links: [], nodes: []}
}
let links = GetLinksList(result_1);
let nodes = GetNodesList(result_1);
let childlist = new ChildrenType(links, nodes);
return childlist;
}
//-----------------------------------