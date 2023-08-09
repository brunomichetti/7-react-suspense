// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
// 🐨 you'll also need to get the fetchPokemon function from ../pokemon:
import {PokemonDataView, fetchPokemon, PokemonErrorBoundary} from '../pokemon'

// 💰 use it like this: fetchPokemon(pokemonName).then(handleSuccess, handleFailure)

// 🐨 create a variable called "pokemon" (using let)
let pokemon
// extra 1, error
let pokemonError

// 💣 delete this now...
// const pokemon = {
//   name: 'TODO',
//   number: 'TODO',
//   attacks: {
//     special: [{name: 'TODO', type: 'TODO', damage: 'TODO'}],
//   },
//   fetchedAt: 'TODO',
// }

// We don't need the app to be mounted to know that we want to fetch the pokemon
// named "pikachu" so we can go ahead and do that right here.
// 🐨 assign a pokemonPromise variable to a call to fetchPokemon('pikachu')

// Extra 2: lo siguiente es comentado, es parte del ejercicio 1 y del extra 1
//----------------------------------------------------------------------------
// // extra 1: poner error por ejemplo mal el nombre del pokemon
// let pokemonPromise = fetchPokemon('pikacha')
//   .then(result => (pokemon = result))
//   .catch(error => (pokemonError = error)) // extra 1

// // 🐨 when the promise resolves, assign the "pokemon" variable to the resolved value
// // 💰 For example: somePromise.then(resolvedValue => (someValue = resolvedValue))

// function PokemonInfo() {
//   // extra 1
//   if (pokemonError) {
//     throw pokemonError
//   }

//   // 🐨 if there's no pokemon yet, then throw the pokemonPromise
//   // 💰 (no, for real. Like: `throw pokemonPromise`)
//   if (!pokemon) {
//     throw pokemonPromise
//   }

//   // if the code gets it this far, then the pokemon variable is defined and
//   // rendering can continue!
//   return (
//     <div>
//       <div className="pokemon-info__img-wrapper">
//         <img src={pokemon.image} alt={pokemon.name} />
//       </div>
//       <PokemonDataView pokemon={pokemon} />
//     </div>
//   )
// }
//----------------------------------------------------------------------------

// Extra 2: Crear un resource, que recibe la promesa, y retorna un objeto con una función read
// que maneja esa promesa
let pokemonResource = createResource(fetchPokemon('pikachu'))

function createResource(promise) {
  let status = 'pending'
  let result = promise.then(
    resolved => {
      status = 'success'
      result = resolved
    },
    rejected => {
      status = 'error'
      result = rejected
    },
  )
  return {
    read() {
      if (status === 'pending') throw result // En este caso result es la misma promesa, por eso se hace throw
      if (status === 'error') throw result // En este caso se hace throw de result que es el error
      if (status === 'success') return result // En este caso retorna result que exitosamente se asignó el valor correcto de la promesa
      throw new Error('This should be impossible')
    },
  }
}

// Extra 2: ahora pokemon info usa resource.read y se olvida del resto que es manejado por el resource
function PokemonInfo() {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

// Extra 3: la definicion de createResource está en otro lado, la utliza en PokemonInfo y se ahorra todo el extra 2.

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        {/* 🐨 Wrap the PokemonInfo component with a React.Suspense component with a fallback */}
        <React.Suspense
          // en el fallback es lo que retorna mientras se ejecuta la función asincrona
          fallback={<div>Please wait while loading Pokemon...</div>}
        >
          {/* Extra 1: usar PokemonErrorBoundary para tirar el error desde pokemonInfo */}
          <PokemonErrorBoundary>
            <PokemonInfo />
          </PokemonErrorBoundary>
        </React.Suspense>
      </div>
    </div>
  )
}

export default App
