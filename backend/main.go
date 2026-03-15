package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/t4net-crawbot/character-sheet/handlers"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://charsheet:charsheet_dev@localhost:5432/charsheet?sslmode=disable"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	log.Println("Connected to database")

	if err := runMigrations(ctx, pool); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migrations complete")

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
	}))

	r.Get("/api/health", handlers.Health(pool))
	r.Route("/api/characters", func(r chi.Router) {
		r.Get("/", handlers.ListCharacters(pool))
		r.Post("/", handlers.CreateCharacter(pool))
		r.Get("/{id}", handlers.GetCharacter(pool))
		r.Patch("/{id}", handlers.PatchCharacter(pool))
		r.Delete("/{id}", handlers.DeleteCharacter(pool))
	})
	r.Get("/api/rules/classes", handlers.GetClasses)
	r.Get("/api/rules/lineages", handlers.GetLineages)
	r.Get("/api/rules/heritages", handlers.GetHeritages)
	r.Get("/api/rules/backgrounds", handlers.GetBackgrounds)

	log.Printf("Server listening on :%s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), r); err != nil {
		log.Fatal(err)
	}
}

func runMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS characters (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id TEXT NOT NULL DEFAULT 'default',
			name TEXT NOT NULL,
			lineage TEXT NOT NULL DEFAULT '',
			heritage TEXT NOT NULL DEFAULT '',
			class TEXT NOT NULL DEFAULT '',
			level INTEGER NOT NULL DEFAULT 1,
			background TEXT DEFAULT '',
			alignment TEXT DEFAULT '',
			xp INTEGER DEFAULT 0,
			luck_points INTEGER DEFAULT 0,
			str_score INTEGER DEFAULT 10,
			dex_score INTEGER DEFAULT 10,
			con_score INTEGER DEFAULT 10,
			int_score INTEGER DEFAULT 10,
			wis_score INTEGER DEFAULT 10,
			cha_score INTEGER DEFAULT 10,
			hp_max INTEGER NOT NULL DEFAULT 8,
			hp_current INTEGER NOT NULL DEFAULT 8,
			hp_temp INTEGER DEFAULT 0,
			saving_throw_profs TEXT[] DEFAULT '{}',
			skill_profs TEXT[] DEFAULT '{}',
			skill_expertise TEXT[] DEFAULT '{}',
			personality_traits TEXT DEFAULT '',
			ideals TEXT DEFAULT '',
			bonds TEXT DEFAULT '',
			flaws TEXT DEFAULT '',
			backstory TEXT DEFAULT '',
			equipment JSONB DEFAULT '[]',
			attacks JSONB DEFAULT '[]',
			spells JSONB DEFAULT '{}',
			talents JSONB DEFAULT '[]',
			features JSONB DEFAULT '[]',
			cp INTEGER DEFAULT 0,
			sp INTEGER DEFAULT 0,
			ep INTEGER DEFAULT 0,
			gp INTEGER DEFAULT 0,
			pp INTEGER DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT now(),
			updated_at TIMESTAMPTZ DEFAULT now()
		);
	`)
	return err
}
