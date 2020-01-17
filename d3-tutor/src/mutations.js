
import {gql} from 'apollo-boost';

const CREATE_NODE = gql`
    mutation CreateNode($label: String,$content:String){
        CreateNode(label:$label,content:$content){
            id,
            label,
            content
        }
    }
`;

const CREATE_CHILD_NODE = gql`
    mutation CreateChildNode($parentId:String,$label: String,$content:String){
        CreateChildNode(parentId:$parentId,label:$label,content:$content){
            id,
            label,
            content
        }
    }
`;

const CONNECT_NODES = gql`
    mutation CreateNode($idFirst:String,$idSecond:String){
        CreateNode(idFirst:$idFirst,idSecond:$idSecond){}
    }
`;

const DELETE_ALL_NODES = gql`
    mutation DeleteAllNodes(){
        DeleteAllNodes(){}
    }
`;

const DELETE_NODE = gql`
    mutation DeleteNode($id:String){
        DeleteAllNodes(id:$id){}
    }
`;

const DELETE_CONNECTION = gql`
    mutation DeleteConnection($idFirst:String,$idSecond:String){
        DeleteConnection(idFirst:$idFirst,idSecond:$idSecond){}
    }
`;

const CHANGE_NODE_LABEL = gql`
    mutation ChangeNodeLabel($id:String,$newLabel:String){
        ChangeNodeLabel(id:$id,newLabel:$newLabel){
            id,
            label,
            content
        }
    }
`;

const CHANGE_NODE_CONTENT = gql`
    mutation ChangeNodeContent($id:String,$newContent:String){
        ChangeNodeContent(id:$id,newContent:$newContent){
            id,
            label,
            content
        }
    }
`;

/*
ПРИМЕР ВЫЗОВА
const foundNode = () => (
    <Mutation mutation={CREATE_NODE}>
        //render the result
    </Mutation>
);
//----------------------------------------

const foundNode = graphql(FIND_NODE,{
    props: ({mutate}) => ({
        FindNode: {label,content} => mutate({
            variables: {id,label,content}
        })
    })
})

*/