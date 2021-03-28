import './App.css'
import {useState, Fragment } from 'react'
import {InputForm} from './inputForm'
import {RecipeView} from './recipe-view'
import { createNoChild } from './util'
import {
	prepend,
	map,
} from 'sanctuary'
import { testRecipes } from './test-recipes'
import YAML from 'yaml'
import { 
	Switch, Route, Link, useHistory,
} from 'react-router-dom'
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
				there&apos;re a lot of coffee recipe websites, but they don&apos;t know how to talk to one another. 
				this website is an open source recipe sharing format, and an open source recipe viewer.
				i hope to help create a more open and friendly specialty coffee ecosystem.
			</p>
			<h2>recipe sharing</h2>
			you can input a new recipe using <Link to='input'>this form</Link>.
			<ul>
				<li>if you want to edit the file by hand, choose <a href="https://chan.dev/posts/comprehending-yaml/">yaml</a></li>
				<li>if you want to send someone the file and want the smallest format, choose json</li>
				<li>if you hate files and love links, don&apos;t create a file, and copy-paste the URL you&apos;re sent to</li>
			</ul>
			<h2>recipe viewing</h2>
			<p>
				you can use this inputter to <label htmlFor="fileInput"> input a recipe file </label>
				<input id='fileInput' type="file" onChange={handleFileInputChange} />
				<br/>
				or you can select one of my <label htmlFor="recipeSelect"> test recipes </label>
				<select id="recipeSelect" name="recipeSelector" value={selected} onChange={handleSelectChange}>
					{
						map (createNoChild ('option')) (selectOptions)
					}
				</select>
				<br/>
				view your selected recipe <Link to='view'>here</Link>.
				<br/>
				(this viewer roughly mirrors <a href="https://aramse.coffee/recipe/">aramse's</a> recipe format.)
			</p>
			<h2>this site is in beta!</h2>
			<p>
				so please send your recommendations/hate/love <a href="mailto:alje@daxi.ml">here</a>
			</p>
			<h2>special thanks to:</h2>
			<ul>
				<li>
					<a href="https://aramse.coffee/recipe">aramse</a> for their pioneering work on a visual recipe representation. i&apos;d never&apos;d thought to make this without them.
				</li>
				<li>
					<a href="https://www.youtube.com/channel/UCMb0O2CdPBNi-QqPk5T3gsQ">James Hoffmann</a> &amp; <a href="https://harkencoffee.com/blogs/news/meet-our-founder-eldric-stuart">Eldic Stuart</a> for letting me host their recipes
				</li>
			</ul>
		</>
	)
}

const App = () => {
	const [recipe, setRecipe] = useState(testRecipes[0])
	console.log('recipe', recipe);
	const history = useHistory()
	const handleSetRecipe = r => {
		setRecipe (r)
		history.push(`/view?recipe=${JSON.stringify(r)}`)
	}
  return (
		<div id='app'>
			<main>
				<Switch>
					<Route path='/view'>
						{createNoChild (RecipeView) ({recipe, handleSetRecipe, setRecipe})}
					</Route>
					<Route path='/input'>
						{createNoChild (InputForm) ({recipe, handleSetRecipe, setRecipe})}
					</Route>
					<Route path='/'>
						{createNoChild (MainMenu) ({recipe, handleSetRecipe, setRecipe})}
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
