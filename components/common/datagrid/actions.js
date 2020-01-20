import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

const DatagridActions = ({actions, state}) => {
  return (state.selection.length > 0) ? actions(state) : React.cloneElement(actions(state), { disabled: true })
}

DatagridActions.propTypes = {
  actions: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired
}

export default observer(DatagridActions)
