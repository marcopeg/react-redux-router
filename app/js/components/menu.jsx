import React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';

export default class Menu extends React.Component {
    static defaultProps = {
        navigate: null
    };
    render() {
        var { navigate } = this.props;
        return (
            <ButtonGroup>
                <Button onClick={$=> navigate('')}>Home</Button>
                <Button onClick={$=> navigate('p/1')}>Page1</Button>
                <Button onClick={$=> navigate('p/2')}>Page2</Button>
            </ButtonGroup>
        );
    }
}
