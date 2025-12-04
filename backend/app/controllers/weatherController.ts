import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import env from '#start/env'
import Bencana from '#models/bencana'

export default class WeatherController { 
    public async getByCity({ request, response }: HttpContext) {
        const city = request.input('city') || request.qs().city

        if (!city) {
            return response.badRequest({
                success: false,
                message: 'City parameter is required',
            })
        }

        try {   
            const apiKey = env.get('WEATHER_API_KEY')

            const res = await axios.get(env.get('WEATHER_API_BASE_URL'), {
                params: {
                    q: city,
                    appid: apiKey,
                    units: 'metric',
                    lang: 'id',
                },
            })

            const data = res.data

      return response.ok({
        success: true,
        data: {
          city: data.name,
          country: data.sys?.country,
          temp: data.main?.temp,
          feelsLike: data.main?.feels_like,
          humidity: data.main?.humidity,
          description: data.weather?.[0]?.description,
          icon: data.weather?.[0]?.icon,
          windSpeed: data.wind?.speed,
        },
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return response.notFound({ message: 'Kota tidak ditemukan' })
      }

      console.error(error)
      return response.internalServerError({
        success: false,
        message: 'Gagal mengambil data cuaca dari OpenWeather',
      })
    }
  }

  public async getByBencana({ params, response }: HttpContext) {
    const bencana = await Bencana.findById(params.id)

    if (!bencana) {
      return response.notFound({
        success: false,
        message: 'Bencana tidak ditemukan',
      })
    }

    if (!bencana.location) {
      return response.badRequest({
        success: false,
        message: 'Lokasi bencana tidak valid',
      })
    }

    const apiKey = env.get('WEATHER_API_KEY')

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: bencana.location,
          appid: apiKey,
          units: 'metric',
          lang: 'id',
        },
      })

      const data = res.data

      return response.ok({
        success: true,
        data: {
          bencanaId: bencana.id,
          location: bencana.location,
          weather: {
            city: data.name,
            country: data.sys?.country,
            temp: data.main?.temp,
            feelsLike: data.main?.feels_like,
            humidity: data.main?.humidity,
            description: data.weather?.[0]?.description,
            icon: data.weather?.[0]?.icon,
            windSpeed: data.wind?.speed,
          },
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal mengambil cuaca untuk bencana ini',
      })
    }
  }
}