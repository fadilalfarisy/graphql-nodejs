import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql'

const app = express()

const leagues = [
  { id: 1, name: 'Premier League' },
  { id: 2, name: 'Liga 1 Shopee' }
]

const teams = [
  { id: 1, name: 'Manchester United', leagueId: 1 },
  { id: 2, name: 'Liverpool', leagueId: 1 },
  { id: 3, name: 'Persib', leagueId: 2 },
  { id: 4, name: 'Rans FC', leagueId: 2 }
]

const players = [
  { id: 1, name: 'Harry Magurie', teamId: 1 },
  { id: 2, name: 'De Gea', teamId: 1 },
  { id: 3, name: 'Salah', teamId: 2 },
  { id: 4, name: 'Van Djik', teamId: 2 },
  { id: 5, name: 'David Dasilva', teamId: 3 },
  { id: 6, name: 'Ciro Alves', teamId: 3 },
  { id: 7, name: 'Raffi Ahmad', teamId: 4 },
  { id: 8, name: 'Rayanza', teamId: 4 }
]

const LeagueType = new GraphQLObjectType({
  name: 'League',
  description: "List leagues football",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    teams: {
      type: new GraphQLList(TeamType),
      resolve: (league) => {
        return teams.filter(team => team.leagueId === league.id)
      },
      players: {
        type: new GraphQLList(PlayerType),
        resolve: (team) => {
          return players.filter(player => player.teamId === team.id)
        }
      }
    }
  })
})

const TeamType = new GraphQLObjectType({
  name: 'Team',
  description: "List teams football",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    leagueId: { type: GraphQLNonNull(GraphQLInt) },
    league: {
      type: LeagueType,
      resolve: (team) => {
        return leagues.find(league => league.id === team.leagueId)
      }
    },
    players: {
      type: new GraphQLList(PlayerType),
      resolve: (team) => {
        return players.filter(player => player.teamId === team.id)
      }
    },
  })
})

const PlayerType = new GraphQLObjectType({
  name: 'Player',
  description: "List players football",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    teamId: { type: GraphQLNonNull(GraphQLInt) },
    teams: {
      type: TeamType,
      resolve: (player) => {
        return teams.find(team => team.id === player.teamId)
      },
      leagues: {
        type: LeagueType,
        resolve: (team) => {
          return leagues.find(league => league.id === team.leagueId)
        }
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    league: {
      type: LeagueType,
      description: 'A Single League',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => leagues.find(league => league.id === args.id)
    },
    leagues: {
      type: new GraphQLList(LeagueType),
      description: 'List of All Leagues',
      resolve: () => leagues
    },
    team: {
      type: TeamType,
      description: 'A Single Team',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => teams.find(team => team.id === args.id)
    },
    teams: {
      type: new GraphQLList(TeamType),
      description: 'List of All Teams',
      resolve: () => teams
    },
    player: {
      type: PlayerType,
      description: 'A Single Player',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => players.find(player => player.id === args.id)
    },
    players: {
      type: new GraphQLList(PlayerType),
      description: 'List of All Players',
      resolve: () => players
    },
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addPlayer: {
      type: PlayerType,
      description: 'Add a player',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        teamId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const newPlayer = { id: players.length + 1, name: args.name, teamId: args.teamId }
        players.push(newPlayer)
        return newPlayer
      }
    },
    editPlayer: {
      type: PlayerType,
      description: 'Add a player',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        teamId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const indexPlayer = getIndexPlayerById(args.id)
        players[indexPlayer].name = args.name
        players[indexPlayer].teamId = args.teamId
        return players[indexPlayer]
      }
    },
    deletePlayer: {
      type: PlayerType,
      description: 'Delete a player',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const indexPlayer = getIndexPlayerById(args.id)
        const deletedPlayer = players.slice(indexPlayer, indexPlayer + 1)
        players.splice(indexPlayer, 1)
        return deletedPlayer[0]
      }
    }
  })
})

const getIndexPlayerById = (id) => {
  const indexPlayer = players.findIndex(player => player.id === id)
  if (indexPlayer < 0) {
    return false
  }
  return indexPlayer
}

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}))

app.get('/', (req, res) => res.redirect('/graphql'))

app.listen(5000, () => console.log('Server Running'))