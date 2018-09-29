class CreateQuizzes < ActiveRecord::Migration[5.1]
  def change
    create_table :quizzes do |t|
      t.string :q_title
      t.text :q_content
      t.string :q_answer1
      t.string :q_answer2
      t.string :q_answer3
      t.string :q_answer4
      t.integer :q_correct
      t.integer :user_id

      t.timestamps
    end
  end
end
