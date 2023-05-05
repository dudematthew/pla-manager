import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

// componentLoader.override('Login', './views/login');

const Components = {
    // MyInput: componentLoader.add('MyInput', './values/my-input'),
    // other custom components
}

export { componentLoader, Components }