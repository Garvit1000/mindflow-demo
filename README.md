# MindFlow: Your AI Mental Wellness Companion 🧠✨

Welcome to MindFlow, your personal AI-powered mental wellness companion! This app is designed to provide you with tools and resources to support your mental health journey. Whether you're looking for soothing music, personalized diet plans, or just someone to talk to, MindFlow is here for you.

## ✨ Features

- **AI Chat Assistant**: Engage in conversations with our AI assistant, designed to provide empathetic support and assess your mental health. 💬
- **Personalized Diet Plans**: Discover diet plans tailored to your BMI and mental state, helping you nourish both your body and mind. 🥗
- **Soothing Music**: Relax and unwind with a curated selection of calming music. 🎶
- **Profile Management**: Keep your information up-to-date and personalize your experience. 👤
- **Location Services**: Track your frequent locations to provide personalized insights and recommendations. 📍

## 🔧 Installation

Follow these steps to get MindFlow up and running on your local machine:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/auth-app.git
    cd auth-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**

    -   Create a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable Authentication and Firestore Database.
    -   Replace the placeholder Firebase configuration in `src/config/firebase.js` with your project credentials:

        ```javascript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };
        ```

4.  **Run the app:**

    ```bash
    npx expo start
    # or
    yarn start
    ```

    Scan the QR code with the Expo Go app on your iOS or Android device.

## 🚀 Usage

### Getting Started

1.  **Onboarding**: New users will go through an onboarding flow to set up their profile.
2.  **Authentication**: Sign up or log in to access the app's features.
3.  **Navigation**: Use the drawer navigation to access different sections of the app, such as Home, Profile, Soothing Music, and Diet.
4.  **AI Chat**: Start a conversation with the AI assistant to discuss your feelings and receive support.
5.  **Music**: Listen to soothing music based on categories like Meditation, Nature Sounds, and Sleep.
6.  **Diet**: View personalized diet plans based on your BMI and mental state.

### Example

Here's an example of how to start a conversation with the AI chat assistant:

```javascript
import ChatScreen from './src/screens/ChatScreen';

// In your navigation:
<Stack.Screen name="Chat" component={ChatScreen} />
```

## 🛠️ Technologies Used

| Category        | Technology                               |
| --------------- | ---------------------------------------- |
| Framework       | React Native                             |
| Navigation      | @react-navigation/native, @react-navigation/drawer, @react-navigation/native-stack          |
| UI Components   | react-native-paper, @rneui/themed, @react-native-material/core       |
| State Management| React Context API                        |
| Authentication  | Firebase Authentication                  |
| Database        | Firebase Firestore                       |
| Storage         | @react-native-async-storage/async-storage |
| AI              | Google Gemini AI                         |
| Music           | Jamendo API                             |
| Location        | Expo Location                             |
| Animation       | Lottie-react-native, react-native-animatable, react-native-reanimated                            |

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute to the project:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:

    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make your changes** and commit them with descriptive commit messages.
4.  **Push your changes** to your forked repository.
5.  **Submit a pull request** to the main branch of the original repository.

Please ensure your code follows the project's coding standards and includes relevant tests.

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
