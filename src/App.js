import {useState, Fragment } from 'react'
import {InputForm} from './inputForm'
import {RecipeView} from './recipe-view'
import { createNoChild } from './util'
import {
	prepend,
	keys,
	map,
} from 'sanctuary'
import { testRecipes } from './test-recipes'
import YAML from 'yaml'
const nameRecipe = ({author, name}) => `${author.name}'s ${name}`

const unsafeLast = xs => xs[xs.length - 1]
const parsers = {
	yaml: YAML.parse,
	yml: YAML.parse,
	json: JSON.parse,
}
const parseFile = fileType => fileString => parsers[fileType.toLowerCase()] (fileString)

const MainMenu = ({setMode, setRecipe}) => {
	const [selected, setSelected] = useState ()
	const [fileRecipe, setFileRecipe] = useState ()
	const allRecipes = fileRecipe ? prepend (fileRecipe) (testRecipes) : testRecipes
	const nameToRecipe = Object.fromEntries(map (recipe => [recipe.name, recipe]) (allRecipes))
	const handleClick = e => setMode(e.target.name)
	const handleSelectChange = e => {
		const {value} = e.target
		setSelected (value)
		setRecipe (nameToRecipe[value])
	}
	const handleFileInputChange = e => {
		const maybeFile = e.target.files[0]
		if (!maybeFile) return
		const {name} = maybeFile
		const fileType = unsafeLast (name.split ('.'))
		maybeFile.text().then(parseFile (fileType)).then(recipe => {
			setFileRecipe (recipe)
			setRecipe (recipe)
			setSelected (recipe.name)
		})
	}
	const selectOptions = map (
		({author, name}) => ({value: name, children: nameRecipe ({author, name}), key: name})
	) (allRecipes)
	return (
		<>
			<h1>welcome 2 the coffee zone</h1>
			<p>
				you can input a new recipe using 
				&nbsp;
				<button name='input' onClick={handleClick}>this form</button>
				<br/>
				or you can select one of my <label htmlFor="recipeSelect"> test recipes </label>
				<select id="recipeSelect" name="recipeSelector" value={selected} onChange={handleSelectChange}>
					{
					map (createNoChild ('option')) (selectOptions)
					}
				</select>
				<br/>
				or you can <label htmlFor="fileInput"> input a recipe you've created previously </label>
				<input id='fileInput' type="file" onChange={handleFileInputChange} />
				<br/>
				and view it <button name='view' onClick={handleClick}>here</button>.
				this viewer roughly mirrors <a href="https://aramse.coffee/recipe/">aramse's</a> recipe format.
			</p>
			<p>
				this site is still very much in beta so recommendations should be sent <a href="mailto:alje@daxi.ml">here</a>
			</p>
			<p>
				thanks!
			</p>
		</>
	)
}

const components = {
	main: MainMenu,
	input: InputForm,
	view: RecipeView,
};
const modes = keys (components)


function App() {
	const [mode, setMode] = useState(modes[0])
	const [recipe, setRecipe] = useState(testRecipes[0])
	const handleSetRecipe = r => {
		setMode ('view')
		setRecipe (r)
	}
  return (
		<Fragment>
			<main>
				{createNoChild (components[mode]) ({setMode, recipe, handleSetRecipe, setRecipe})}
			</main>
			<hr/>
			<footer>
				<a href="mailto:alje@daxi.ml">contact</a>
			</footer>
		</Fragment>
  )
}

export default App;
