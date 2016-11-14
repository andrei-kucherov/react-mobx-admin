import React from 'react'
import { Card, CardTitle, CardActions } from 'material-ui/Card'
import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import AddIcon from 'material-ui/svg-icons/content/add'
import Datagrid from '../datagrid/datagrid'
import Filters from '../datagrid/filters'
import Pagination from '../datagrid/pagination'
import DatagridActions from '../../common/datagrid/actions'


export default class MUIListView extends React.Component {

  onSelectionChange(selection) {
    if(selection === 'all') {
      this.props.state.selectAll(this.props.state.currentView)
    } else if(selection === 'none') {
      this.props.state.updateSelection(this.props.state.currentView, [])
    } else {
      this.props.state.updateSelection(this.props.state.currentView, selection)
    }
  }

  render() {
    const { state, onAddClicked } = this.props

    function isSelected(idx) {
      return state.currentView.selection.indexOf(idx) >= 0
    }

    const loading = (! state.currentView.items) || state.currentView.items.length === 0

    if(loading) {
      return <CircularProgress />
    }

    const title = state.currentView.title ? <CardTitle title={state.currentView.title} /> : null
    const filters = (this.filters && ! loading) ? (
      <Filters.Controls state={state}
        hideFilter={(filter)=>state.hideFilter(state.currentView, filter)} filters={this.filters} />
    ) : null
    const grid = (loading) ? <CircularProgress color="#fff" /> : (
      <Datagrid items={state.currentView.items} attrs={state.currentView.attrs}
        titles={state.currentView.headertitles} fields={this.fields}
        rowId={(row)=>row[state.currentView.pkName]}
        listActions={this.listActions ? this.listActions.bind(this) : undefined}
        onSort={(field, dir)=>state.updateSort(state.currentView, field, dir)} sortstate={state.currentView}
        onRowSelection={this.onSelectionChange.bind(this)} isSelected={isSelected} />
    )
    const pagination = (loading) ? null : <Pagination state={state} onChange={(page)=>state.updatePage(state.currentView, page)} />
    const actions = (loading) ? null : (
      <CardActions style={{ zIndex: 2, display: 'inline-block', float: 'right' }}>
        <Filters.Apply state={state} label={'apply filters'} apply={()=>state.applyFilters(state.currentView)} />
        {this.batchActions && (<DatagridActions state={state} actions={this.batchActions} />)}
        {this.filters && (
          <Filters.Dropdown state={state} title="addfilter" filters={this.filters}
            showFilter={(filter)=>state.showFilter(state.currentView, filter)} />
        )}
        <FlatButton label={state.currentView.addText} icon={<AddIcon />}
          onTouchTap={() => onAddClicked(state)} />
      </CardActions>
    )

    const result = (
      <Card style={{ margin: '2em', opacity: state.loading ? 0.8 : 1 }}>
        { actions }

        { title }
        { filters }
        { grid }
        { pagination }
      </Card>
    )

    return this.renderOuter ? this.renderOuter(result) : result
  }

  static propTypes = {
    state: React.PropTypes.object.isRequired
  }

}