require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const botToken = process.env.BOT_TOKEN;
const openWeatherApiKey = process.env.OPENWEATHERMAP_API_KEY; // Replace with your OpenWeatherMap API key
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name;

  bot.sendMessage(chatId, `Welcome, ${username}! How would you like to check the weather?`, {
    reply_markup: {
      keyboard: [[{ text: "Send Location", request_location: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.on("location", async (msg) => {
  const chatId = msg.chat.id;
  const latitude = msg.location.latitude;
  const longitude = msg.location.longitude;

  try {
    const weatherData = await getWeatherData(latitude, longitude);
    bot.sendPhoto(chatId, weatherData.imageUrl, { caption: weatherData.message });
  } catch (error) {
    bot.sendMessage(chatId, "Sorry, I couldn't fetch the weather data. Please try again.");
  }
});

async function getWeatherData(latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;

  const response = await axios.get(apiUrl);
  const data = response.data;

  if (data.cod === "404") {
    throw new Error("City not found");
  }

  const temperature = data.main.temp;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const weatherDescription = data.weather[0].description;
  const cityName = data.name;
  const imageUrl = `https://source.unsplash.com/1600x900/?${cityName}`;

  const message = `🌍 Location: ${cityName}\n🌡️ Temperature: ${temperature}°C\n💧 Humidity: ${humidity}%\n💨 Wind Speed: ${windSpeed} m/s\n☁️ Weather: ${weatherDescription}`;

  return { message, imageUrl };
}