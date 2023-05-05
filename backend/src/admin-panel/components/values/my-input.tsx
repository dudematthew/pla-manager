import React from 'react'

// just some regular React component
const MyInputComponent = (props) => {
    console.log(props);

    return <span>Siema {props.resource.id}</span>
}

export default MyInputComponent