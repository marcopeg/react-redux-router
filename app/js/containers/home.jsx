import React from 'react';
import { connect } from 'react-redux';

@connect(state => state)
export default class Home extends React.Component {
    render() {
        console.log('render home page');
        return <div>home page</div>;
    }
}
