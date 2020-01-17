
import {gql} from 'apollo-boost';

const FIND_NODE = gql`
    query FindNode($id: String){
        FindNode(id:$id){
            id,
            label,
            content
        }
    }
`;

const FIND_CHILDREN = gql`
    quety FindChildren($parentId: String){
        FindChildren(id:$parentId){}
    }
`;

/*
ПРИМЕР ВЫЗОВА
import {compose} from 'recompose';
import {graphql} from 'react-apollo';

const foundNode = () => (
    <Query query={FIND_NODE}>
        //render the result
    </Query>
);

*/