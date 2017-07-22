require 'csv'
require 'pry'
namespace :parse_data do
  desc "Import Fitness Data"
  task import_fitness: :environment do
    Tutorial.destroy_all
    CSV.foreach('./lib/assets/fitness.csv', :headers => true) do |row|
      Tutorial.create(description: row["Overveiw"]) if row["Overveiw"]
    end
  end

  desc "import images"
  task import_images: :environment do
    Image.destroy_all
    images = ["image_logo", "image_main","image_1","image_2","image_3","image_4","image_5","image_6","image_7","image_8","image_9","image_10", "image_console"]
    CSV.foreach('./lib/assets/fitness.csv', :headers => true) do |row|
      tutorial = Tutorial.find_by(description: row["Overveiw"])
      images.each do |image_header|
        Image.create(url: row[image_header], tutorial_id: tutorial.id) if row[image_header]
      end
    end
  end

  desc "import equipments"
  task import_equipments: :environment do
    # equipments = ["Product_Name"]
    CSV.foreach('./lib/assets/fitness.csv', :headers => true) do |row|
      tutorial = Tutorial.find_by(description: row["Overveiw"])
      # equipments.each do |equipment|
      # binding.pry
      tutorial.update(equipment: row["Product_Name"]) if row["Product_Name"] && tutorial
      # end
    end
  end
end
