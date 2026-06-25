import Login from './views/Login.vue'
import TextList from './views/TextList.vue'
import TextEditor from './views/TextEditor.vue'
import TextDetail from './views/TextDetail.vue'

export default [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: TextList },
  { path: '/create', name: 'Create', component: TextEditor },
  { path: '/edit/:id', name: 'Edit', component: TextEditor, props: true },
  { path: '/text/:id', name: 'Detail', component: TextDetail }
]
