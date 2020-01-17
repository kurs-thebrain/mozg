import {neo4j, QueryResult} from 'neo4j-driver';

const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, 
GraphQLBoolean, GraphQLSchema} = graphql;

//возвращает драйвер подключения к neo4j
function GetNeo4jDriver(){
    return neo4j.driver(
        'bolt://localhost:7687', 
        neo4j.auth.basic("neo4j","neo4j")
    );
}

//Типы данных---------------------------
const LinkType = {
    source,
    target
}

const NodeType = new GraphQLObjectType({
    name: 'Node',
    fields: () => ({
        id: {type:GraphQLString},
        label: {type:GraphQLString},
        content: {type:GraphQLString}
    })
});

const ChildrenType = new GraphQLObjectType({
    name: 'Children',
    fields: () => ({
        relations: {type:GraphQLString},
        children: {type:GraphQLString}
    })
});
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
    let links= new Array();
    let idFirst = 0;
    let idSecond  = 0;
    result.records.forEach(nodeRecord => {
        let properties = nodeRecord.get(0).properties;
        if(idSecond != 0){
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
    let nodes = new Array();
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

let i = 4;

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        CreateNode:{
            type: NodeType,
            args: {
                label: {type:GraphQLString},
                content:  {type:GraphQLString}
            },
            resolve(parent,args){
                let driver = GetNeo4jDriver();
                let session = driver.session();
                let query = 'CREATE (n:NodeType{id:{ID}, label:{LABEL}, '+
                'content:{CONTENT}}) RETURN n';
                let params = {ID:id,LABEL:args.label,CONTENT:args.content};
                const promise = session.run(query,params);
                return promise.then(result => {
                    session.close();
                    const singleRecord = result.records[0];
                    let nodeRecord = singleRecord.get(0).properties;
                    driver.close();
                    ++id;    
                    return new NodeType(
                        nodeRecord.id,
                        nodeRecord.label,
                        nodeRecord.content
                    );      
                });
            }
        },
        CreateChildNode:{
            type: NodeType,
            args: {
                parentId: {type:GraphQLString},
                label: {type:GraphQLString},
                content: {type:GraphQLString}
            },
            resolve(parent,args){
                let driver = GetNeo4jDriver();
                let session = driver.session();
                let query = 'MATCH (b:NodeType{id:{PARENTID}}) CREATE (a:NodeType{id:{ID}, label:{LABEL}, '+
                'content:{CONTENT}})<-[r1:RELATION]-(b) CREATE (a)-[r2:RELATION]->(b) RETURN a';
                let params = {PARENTID:args.parentId,ID:id,LABEL:args.label,CONTENT:args.content};
                const promise = session.run(query,params);
                return promise.then(result => {
                    session.close();
                    const singleRecord = result.records[0];
                    let nodeRecord = singleRecord.get(0).properties;
                    driver.close();
                    ++id;    
                    return new NodeType(
                        nodeRecord.id,
                        nodeRecord.label,
                        nodeRecord.content
                    );      
                });
            }
        },
        ConnectNodes:{
            type: GraphQLBoolean,
            args: {
                idFirst: {type:GraphQLString},
                idSecond: {type:GraphQLString}
            },
            resolve(parent,args){
                let driver = GetNeo4jDriver();
                let session = driver.session();
                let query = 'MATCH (a:NodeType{id:{IDFIRST}}),(b:NodeType{id:{IDSECOND}}) '+
                'CREATE (a)<-[r1:RELATION]-(b)<-[r2:RELATION]-(a)';
                let params = {IDFIRST:args.idFirst,IDSECOND:args.idSecond};
                return session.run(query,params)
                .then(result => {
                    session.close();
                    driver.close();
                    if(result) return true;
                    else return false;
                });
            }
        },
        DeleteAllNodes:{
            type: GraphQLBoolean,
            resolve(parent,args){
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
        },
        DeleteNode: {
            type: GraphQLBoolean,
            args: {
                id: {type:GraphQLString}
            },
            resolve(parent,args){
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
        },
        DeleteConnection: {
            type: GraphQLBoolean,
            args: {
                idFirst: {type:GraphQLString},
                idSecond: {type:GraphQLString}
            },
            resolve(parent,args){
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
        },
        ChangeNodeLabel: {
            type: NodeType,
            args: {
                id: {type:GraphQLString},
                newLabel:  {type:GraphQLString},
            },
            resolve(parent,args){
                let driver = GetNeo4jDriver();
                let session = driver.session();
                let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
                'label:{LABEL}';
                let params = {ID:id,LABEL:args.label};
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
        },
        ChangeNodeContent: {
            type: NodeType,
            args: {
                id: {type:GraphQLString},
                newContent:  {type:GraphQLString},
            },
            resolve(parent,args){
                let driver = GetNeo4jDriver();
                let session = driver.session();
                let query = 'MATCH (n:NodeType{id:{ID}}) SET n={id:n.id '+
                'content:{CONTENT}';
                let params = {ID:id,LABEL:args.content};
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
        }
    }
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        FindNode: {
            type: NodeType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parent,args){
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
        },
        FindChildren: {
            type: GraphQLString,
            args: {
                parentId: {type:GraphQLString}
            },
            resolve(parent,args){
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
                    return JSON.stringify(childlist);
                });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
});
