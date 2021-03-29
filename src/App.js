import './all.css'
import {useState } from 'react'
import {InputForm} from './pages/input-form'
import {RecipeView} from './pages/recipe-view'
import { MainMenu } from './pages/main-menu'
import { createNoChild } from './util'
import {
	pipe,
} from 'sanctuary'
import { testRecipes } from './test-recipes'
import { 
	Switch, Route, useHistory,
} from 'react-router-dom'
const makeRecipeUrl = pipe([
	JSON.stringify,
	encodeURIComponent,
	s => `/view?recipe=${s}`
])

const App = () => {
	const [recipe, setRecipe] = useState(testRecipes[0])
	console.log('recipe', recipe);
	const history = useHistory()
	const handleSetRecipe = r => {
		history.push(makeRecipeUrl (r))
	}
	const linkToRecipe = makeRecipeUrl (recipe)
  return (
		<div id='app'>
			<main>
				<Switch>
					<Route path='/view'>
						{createNoChild (RecipeView) ({handleSetRecipe, setRecipe})}
					</Route>
					<Route path='/input'>
						{createNoChild (InputForm) ({recipe, handleSetRecipe, setRecipe})}
					</Route>
					<Route path='/'>
						{createNoChild (MainMenu) ({recipe, linkToRecipe, setRecipe})}
					</Route>
				</Switch>
			</main>
			<hr/>
			<footer>
				<a href="mailto:alje@daxi.ml">contact</a>
			</footer>
		</div>
  )
}

export default App
