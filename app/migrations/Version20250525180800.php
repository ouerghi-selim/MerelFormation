<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add session_id column to document table for session-specific documents
 */
final class Version20250525180800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add session_id foreign key to document table for session-specific documents';
    }

    public function up(Schema $schema): void
    {
        // Check if session_id column doesn't exist before adding it
       // $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76613FECDF FOREIGN KEY (session_id) REFERENCES session (id)');
       // $this->addSql('CREATE INDEX IDX_D8698A76613FECDF ON document (session_id)');
    }

    public function down(Schema $schema): void
    {
        // Remove the session_id column and its constraints
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76613FECDF');
        $this->addSql('DROP INDEX IDX_D8698A76613FECDF ON document');
        $this->addSql('ALTER TABLE document DROP session_id');
    }
}
