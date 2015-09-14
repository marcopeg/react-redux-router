import React from 'react';

import { connect } from 'react-redux';
import { changePage } from 'actions/router';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import Menu from 'components/menu';


@connect(state => state)
export default class App extends React.Component {
    
    navigate = (uri) => {
        var { dispatch } = this.props;
        dispatch(changePage(uri));
    }

    render() {

        var { account, dispatch } = this.props;

        return (
            <Grid>
                <Row style={{marginTop:20}}>
                    <Col sm={8}>
                        <h4>ReactJS + Redux + Router</h4>
                    </Col>
                    <Col sm={12} className="_text-right">
                        <Menu navigate={this.navigate} />
                    </Col>
                </Row>
                <hr />
                {this.props.children}
            </Grid>
        );
    }
}
