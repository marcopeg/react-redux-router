
import { LOCATION_DID_CHANGE } from 'redux-react-router/lib/actionTypes';

export function changePage(uri) {
    return {
        type: LOCATION_DID_CHANGE,
        payload: {
            pathname: '/' + uri
        }
    };
}
