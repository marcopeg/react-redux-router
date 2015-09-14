import React from 'react';
import { connect } from 'react-redux';

@connect(state => state)
export default class Page extends React.Component {
    render() {
        console.log('render page', this.props.params.pageId);
        return <div>page {this.props.params.pageId}</div>;
    }
}
