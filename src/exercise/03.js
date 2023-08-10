// useTransition for improved loading states
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
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

// 🐨 create a SUSPENSE_CONFIG variable right here and configure timeoutMs to
// whatever feels right to you, then try it out and tweak it until you're happy
// with the experience.
const SUSPENSE_CONFIG = {timeoutMs: 4000}

function createPokemonResource(pokemonName) {
  // 🦉 once you've finished the exercise, play around with the delay...
  // the second parameter to fetchPokemon is a delay so you can play around
  // with different timings
  let delay = 3000
  // try a few of these fetch times:
  // shows busy indicator
  // delay = 450

  // shows busy indicator, then suspense fallback
  // delay = 5000

  // shows busy indicator for a split second
  // 💯 this is what the extra credit improves
  // delay = 200
  return createResource(fetchPokemon(pokemonName, delay))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  // 🐨 add a useTransition hook here
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)

  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    // 🐨 wrap this next line in a startTransition call
    startTransition(() => {
      setPokemonResource(createPokemonResource(pokemonName))
    })

    // 🐨 add startTransition to the deps list here
  }, [pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      {/*
      En el extra 1, define una clase css, para atrasar el loading state por si la conexión es muy rapida
      Esto es para evitar que se vea el loading state por menos de un segundo, ya que puede confundir
      hace <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}></div> 
      lo hace escribiendo reglas css
      */}

      {/*
      En el extra 2, agrega a SUSPENSE_CONFIG dos propiedades:
      - busyDelayMs: Set this to the time of our CSS transition.
        This is the part that says “if the transition takes X amount of time”
      - busyMinDurationMs: Set this to the total time you want the transition 
        state to persist if we surpass the busyDelayMs time.
      
      con un ejemplo es mas claro: si busyDelayMS vale 300 ms, esto es el tiempo que se atrasa el mostrar el loading.
      y si busyMinDurationMs vale 700, esto es el tiempo mínimo que se muestra el loading en caso de que se demore 
      mas de 300 ms en responder (mas de busyDelayMS ms)
      */}

      {/*
        🐨 add inline styles here to set the opacity to 0.6 if the
        useTransition above is pending
      */}
      <div style={{opacity: isPending ? 0.6 : 1}} className="pokemon-info">
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default App
