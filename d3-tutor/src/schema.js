
var neo4j = require('neo4j-driver');

//возвращает драйвер подключения к neo4j
function GetNeo4jDriver(){
    return neo4j.driver(
        'bolt://localhost:7687', 
        neo4j.auth.basic('neo4j','drizzt')
    );
}

//Типы данных---------------------------
class LinkType{
    source;
    target;
}

export class NodeType{
    id;
    label;
    content;

    constructor(id,label,content){
        this.id = id;
        this.label = label;
        this.content = content;
    }
};

export class ChildrenType{
    relations;
    children;

    constructor(relations,children){
        this.relations = relations;
        this.children = children;
    }
};
//--------------------------------------

//--------------------------------------
//узнает, связаны ли два узла
function AreNodesConnection(idFirst,idSecond){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 'MATCH (a:Node{id:{IDFIRST}})-[r]->'+
    '(b:Node{id:{IDSECOND}}) RETURN CASE WHEN r IS '+
    'NULL THEN false ELSE true END AS c';
    let params = {IDFIRST:idFirst,IDSECOND:idSecond};
    return session.run(query,params)
    .then(result => {
        session.close();
        driver.close();
        if(result.records[0]) return true;
        else return false;
    });
}

//возвращает json-объект со списком связей
function GetLinksList(result){
    let links=[];
    let idFirst = 0;
    let idSecond  = 0;
    result.records.forEach(nodeRecord => {
        let properties = nodeRecord.get(0).properties;
        if(idSecond !== 0){
            idFirst = properties.id;
            idSecond = 0;
        } else {
            idSecond = properties.id;
            if(AreNodesConnection(idFirst,idSecond)){
                links.add(new LinkType(idFirst,idSecond));
            }
        }
    });
    return JSON.stringify(links);
}

//возвращает json-объект со списком узлов
function GetNodesList(result){
    let nodes = [];
    result.records.forEach(nodeRecord => {
        let properties = nodeRecord.get(0).properties;
        nodes.add(new NodeType(
            properties.id,
            properties.label,
            properties.content,
        ));
    });
    return JSON.stringify(nodes);
}
//-----------------------------------

static let _id = 1;

//Мутации----------------------------
export function CreateNode(label,content){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 'CREATE (n:NodeType{id:{ID}, label:{LABEL}, '+
    'content:{CONTENT}}) RETURN n';
    let params = {ID:_id,LABEL:label,CONTENT:content};
    const promise = session.run(query,params);
    return promise.then(result => {
        session.close();
        const singleRecord = result.records[0];
        let nodeRecord = singleRecord.get(0).properties;
        driver.close();
        ++_id;   
        return new NodeType(
            nodeRecord.id,
            nodeRecord.label,
            nodeRecord.content 
        ); 
    });
}

export function CreateChildNode(parentId,label,content){
    let driver = GetNeo4jDriver();
    let session = driver.session();
    let query = 'MATCH (b:NodeType{id:{PARENTID}}) CREATE (a:NodeType{id:{ID}, label:{LABEL}, '+
    'content:{CONTENT}})<-[r1:RELATION]-(b) CREATE (a)-[r2:RELATION]->(b) RETURN a';
    let params = {PARENTID:parentId,ID:_id,LABEL:label,CONTENT:content};
    const promise = session.run(query,params);
    return promise.then(result => {
        session.close();
        const singleRecord = result.records[0];
        let nodeRecord = singleRecord.get(0).properties; 
        driver.close(); 
        ++_id;    
        return new NodeType(
            nodeRecord.id,
            nodeRecord.label,
            nodeRecord.content
        ); 
    });
}

export function ConnectNodes(idFirst,idSecond){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (a:NodeType{id:{IDFIRST}}),(b:NodeType{id:{IDSECOND}}) '+
        'CREATE (a)<-[r1:RELATION]-(b)<-[r2:RELATION]-(a)';
        let params = {IDFIRST:idFirst,IDSECOND:idSecond};
        return session.run(query,params)
        .then(result => {
            session.close();
            driver.close();
            if(result) return true;
            else return false;
        });
}

export function DeleteAllNodes(){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (a:NodeType)-[r]-(), (b:Node) DELETE a,b,r';
        return session.run(query)
        .then(result => {
            session.close();
            driver.close();
            if(result) return true;
            else return false;
        });
}

export function DeleteNode(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}})-[r]-() DELETE n,r';
        let params = {ID:id};
        return session.run(query,params)
        .then(result => {
            session.close();
            driver.close();
            if(result) return true;
            else return false;
        });
}

export function DeleteConnection(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}})-[r]-() DELETE r';
        let params = {ID:id};
        return session.run(query,params)
        .then(result => {
            session.close();
            driver.close();
            if(result) return true;
            else return false;
        });
}

export function ChangeNodeLabel(id,newLabel){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
        'label:{LABEL}';
        let params = {ID:id,LABEL:newLabel};
        const promise = session.run(query,params);
        return promise.then(result => {
            session.close();
            const singleRecord = result.records[0];
            let nodeRecord = singleRecord.get(0).properties;
            driver.close();    
            return new NodeType(
                nodeRecord.id,
                nodeRecord.label,
                nodeRecord.content
            );
        });
}

export function ChangeNodeContent(id,newContent){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
        'content:{CONTENT}';
        let params = {ID:id,LABEL:newContent};
        const promise = session.run(query,params);
        return promise.then(result => {
            session.close();
            const singleRecord = result.records[0];
            let nodeRecord = singleRecord.get(0).properties;
            driver.close();    
            return new NodeType(
                nodeRecord.id,
                nodeRecord.label,
                nodeRecord.content
            );
        });
}
//-----------------------------------

//Запросы----------------------------
export function FindNode(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (n:NodeType{id:{ID}}) RETURN n';
        let params = {ID:id};
        const promise = session.run(query,params);
        return promise.then(result => {
            session.close();
            const singleRecord = result.records[0];
            let nodeRecord = singleRecord.get(0).properties;
            driver.close();    
            return new NodeType(
                nodeRecord.id,
                nodeRecord.label,
                nodeRecord.content
            );      
        });
}

export function FindChildren(id){
        let driver = GetNeo4jDriver();
        let session = driver.session();
        let query = 'MATCH (a:NodeType{id:{ID}})-[r:RELATION]->(b) RETURN b';
        let params = {ID:id};
        return session.run(query,params)
        .then(result => {
            session.close();
            let relations = GetLinksList(result);
            let children = GetNodesList(result);
            driver.close();
            let childlist = new ChildrenType(relations,children);
            return childlist;
        });
}
//-----------------------------------