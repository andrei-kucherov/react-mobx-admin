import {observable, computed, action, transaction, asMap, toJS} from 'mobx'
import DataManipState from './data_manip'

export default class DataTableState extends DataManipState {

  @action showEntityList(entityName, query = {}) {
    this.initView(`${entityName}_list`, {
      entityName: entityName,
      page: parseInt(query.page || 1),
      sortField: query.sortField,
      sortDir: query.sortDir,
      totalItems: 0,
      items: [],
      selection: [],
      filters: asMap(query.filters || {})
    })
    this._refreshList()
  }

  @action
  updatePage(page) {
    this.currentView.page = parseInt(page)
    this._refreshList()
  }

  @action
  updateSort(sortField, sortDir) {
    transaction(() => {
      this.currentView.sortField = sortField
      this.currentView.sortDir = sortDir
    })
    this._refreshList()
  }

  @action
  refresh() {
    this._refreshList()
  }

  @action
  deleteData(data) {
    const id = this.originEntityId

    return this.callRequester(() => {
      return this.requester.deleteEntry(this.view, id)
    })
  }

  @action
  deleteSelected() {
    this.callRequester(() => {
      const promises = this.currentView.selection.map((selected) => {
        const id = this.currentView.items[selected][this.currentView.pkName]
        return this.requester.deleteEntry(this.currentView.entityName, id)
      })
      return Promise.all(promises).then(() => {   // wait for all delete reqests
        this.currentView.selection = []
        return this._refreshList()
      })
    })
  }

  // ---------------------- selection  ----------------------------

  @computed get selected_ids() {
    return this.currentView.selection.map((selected) => {
      return this.currentView.items[selected][this.currentView.pkName]
    })
  }

  @action
  updateSelection(data) {
    this.currentView.selection = data
  }

  @action selectAll() {
    this.currentView.selection = this.currentView.items.map((i, idx) => idx)
  }

  // ---------------------- filtration  ----------------------------

  @action
  updateFilterValue(name, value) {
    this.currentView.filters.set(name, value)
  }

  @action
  applyFilters() {
    this._refreshList()
  }

  @action
  showFilter(filter) {
    this.currentView.filters.set(filter, undefined)
  }

  @action
  hideFilter(filter) {
    this.currentView.filters.delete(filter)
    this._refreshList()
  }

  _resetFilters(newFilters) {
    this.currentView.filters.clear()
    for(let i in newFilters) {
      this.currentView.filters.set(i, newFilters[i])
    }
  }

  table_query() {
    const rv = []
    if(this.currentView.page) {
      rv.push(`page=${this.currentView.page}`)
    }
    if(this.currentView.sortField) {
      rv.push(`sortField=${this.currentView.sortField}&sortDir=${this.currentView.sortDir}`)
    }
    if(this.currentView.filters.size > 0) {
      rv.push(`filters=${JSON.stringify(this.currentView.filters)}`)
    }
    return rv.join('&')
  }

  // ---------------------- privates, support ----------------------------

  _refreshList() {
    return this.callRequester(() => {
      return this.requester.getEntries(this.currentView.entityName, {
        page: this.currentView.page,
        sortField: this.currentView.sortField,
        sortDir: this.currentView.sortDir,
        filters: toJS(this.currentView.filters),
        perPage: this.currentView.perPage
      }).then((result) => {
        transaction(() => {
          this.currentView.totalItems = result.totalItems
          this.currentView.items && this.currentView.items.replace(result.data)
        })
      })
    })
  }

}
