// Cache resources
// http://localhost:3000/isolated/exercise/04.js

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

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

// 🐨 create a pokemonResourceCache object
// const pokemonResourceCache = {}
// extra 1: usar useContext. Creo el context con el objeto vacío inicialmente.
// const PokemonResourceCacheContext = React.createContext(getPokemonResource)

// extra 2: Usar context provider
// creo contexto con undefined inicialmente. Defino el cache provider
// extra 3: agregar cacheDurationMs, para limpiar la cache de un pokemon cada cierto tiempo
const PokemonResourceCacheContext = React.createContext()
function PokemonCacheProvider({children, cacheDurationMs}) {
  const cache = React.useRef({})
  // extra 3: mantengo 2 dicts, 1 para el pokemon, otro para la duración del cache del pokemon
  const cacheExpirationsTimes = React.useRef({})

  // uso callback con el name
  const getPokemonResource = React.useCallback(
    name => {
      let resource = cache.current[name]
      if (!resource) {
        resource = createPokemonResource(name)
        cache.current[name] = resource
        // extra 3: seteo el tiempo
        cacheExpirationsTimes.current[name] = Date.now() + cacheDurationMs
      }
      return resource
    },
    [cacheDurationMs],
  )

  // extra 3: ejecutar funcion cada segundo para ver si hay que limpiar algun cache
  React.useEffect(() => {
    const interval = setInterval(() => {
      for (const [name, time] of Object.entries(
        cacheExpirationsTimes.current,
      )) {
        if (time < Date.now()) {
          // si se pasó el tiempo, elimino
          delete cache.current[name]
          delete cacheExpirationsTimes.current[name]
        }
      }
    }, 1000) // Se ejecuta cada segundo

    return () => clearInterval(interval)
  }, [])

  return (
    <PokemonResourceCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonResourceCacheContext.Provider>
  )
}

// 🐨 create a getPokemonResource function which accepts a name checks the cache
// for an existing resource. If there is none, then it creates a resource
// and inserts it into the cache. Finally the function should return the
// resource.
// function getPokemonResource(name) {
//   let resource = pokemonResourceCache[name]
//   if (!resource) {
//     resource = createPokemonResource(name)
//     pokemonResourceCache[name] = resource
//   }
//   return resource
// }

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)
  // extra 1: usar useContext
  // extra 2 tambien
  const getPokemonResource = React.useContext(PokemonResourceCacheContext)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      // 🐨 change this to getPokemonResource instead
      // setPokemonResource(createPokemonResource(pokemonName))
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

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
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
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

// extra 2: wrappeo la app en el provider
function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheDurationMs={5000}>
      <App />
    </PokemonCacheProvider>
  )
}

// export default App
export default AppWithProvider
