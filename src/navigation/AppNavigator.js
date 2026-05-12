import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ClientScreen from "../screens/ClientScreen";
import ClientRequestsScreen from "../screens/ClientRequestsScreen";
import RequestsScreen from "../screens/RequestsScreen";
import MesRequestsScreen from "../screens/MesRequestsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatScreen from "../screens/ChatScreen";
import TrackingScreen from "../screens/TrackingScreen";
import AdminNoticeScreen from "../screens/AdminNoticeScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { AuthContext } from "../context/AuthContext";
import theme from "../utils/theme";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TOKEN_KEY = "token";
const USER_KEY = "user";

const clearSessionStorage = async () => {
  await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
};

function HeaderTitle({ title }) {
  return (
    <View style={styles.headerTitleWrapper}>
      <Text style={styles.headerLogo}>🚚</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function HeaderTitleDark({ title }) {
  return (
    <View style={styles.headerTitleWrapper}>
      <Text style={styles.headerLogo}>🚚</Text>
      <Text style={styles.headerTitleDark}>{title}</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={({ navigation, route }) => ({
        headerTitle: () => (
          <HeaderTitle
            title={
              route.name === "Login" ? "Connexion" : route.name === "Register" ? "Inscription" : "Bienvenue"
            }
          />
        ),
        headerTitleAlign: "center",
        headerStyle: styles.headerStyle,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
        headerLeft: () =>
          navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          ) : null,
      })}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ClientTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: styles.headerStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
          headerTitle: () => <HeaderTitle title="Accueil" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Client"
        component={ClientScreen}
        options={{
          title: "Demande",
          headerTitle: () => <HeaderTitle title="Créer une demande" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="ClientRequests"
        component={ClientRequestsScreen}
        options={{
          title: "Mes demandes",
          headerTitle: () => <HeaderTitle title="Mes demandes" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📄</Text>,
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Tracking",
          headerTitle: () => <HeaderTitle title="Suivi colis" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          headerTitle: () => <HeaderTitle title="Messagerie" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          headerTitle: () => <HeaderTitle title="Notifications" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          headerTitle: () => <HeaderTitleDark title="Profil" />,
          headerStyle: styles.headerStyleDark,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function TransporteurTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: styles.headerStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
          headerTitle: () => <HeaderTitle title="Accueil" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          title: "Disponibles",
          headerTitle: () => <HeaderTitle title="Demandes disponibles" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🚚</Text>,
        }}
      />
      <Tab.Screen
        name="MesRequests"
        component={MesRequestsScreen}
        options={{
          title: "Mes trajets",
          headerTitle: () => <HeaderTitle title="Mes trajets" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>✅</Text>,
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: "Tracking",
          headerTitle: () => <HeaderTitle title="Suivi colis" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          headerTitle: () => <HeaderTitle title="Messagerie" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          headerTitle: () => <HeaderTitle title="Notifications" />,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profil",
          headerTitle: () => <HeaderTitleDark title="Profil" />,
          headerStyle: styles.headerStyleDark,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const rawUser = await AsyncStorage.getItem(USER_KEY);
        if (savedToken && rawUser) {
          const parsed = JSON.parse(rawUser);
          setToken(savedToken);
          setUser(parsed);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    restoreSession();
  }, []);

  const authContextValue = useMemo(
    () => ({
      token,
      user,
      signIn: async ({ token: newToken, user: newUser }) => {
        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
      },
      signOut: async () => {
        await clearSessionStorage();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  const role = String(user?.role || "").trim().toLowerCase();
  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isBootstrapping ? (
            <RootStack.Screen name="Splash" component={SplashScreen} />
          ) : !isAuthenticated ? (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          ) : role === "admin" ? (
            <RootStack.Screen name="AdminApp" component={AdminNoticeScreen} />
          ) : role === "client" ? (
            <RootStack.Screen name="ClientApp" component={ClientTabs} />
          ) : role === "transporteur" ? (
            <RootStack.Screen name="TransporteurApp" component={TransporteurTabs} />
          ) : (
            <RootStack.Screen name="UserApp" component={ClientTabs} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.header,
  },
  headerTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    fontSize: 18,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  headerTitleDark: {
    color: theme.colors.headerDarkText,
    fontSize: 16,
    fontWeight: "700",
  },
  headerStyleDark: {
    backgroundColor: theme.colors.headerDarkBg,
    ...theme.shadows.headerDark,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.headerDarkBorderBottom,
  },
  backButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: theme.colors.white,
    borderTopWidth: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabIcon: {
    fontSize: 18,
  },
});