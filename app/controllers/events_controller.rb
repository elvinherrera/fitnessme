class EventsController < ApplicationController
  before_action :authenticate_user!
  def index
    @events = Event.all
  end

  def profile_event
    @events = Event.all.where(id: params[:id])
  end

  def new
    @event = Event.new
  end

  def create
    @event = Event.new(

    )
    if @event.save
      flash[:success] = "Event Created"
      redirect_to "/events/#{@event.id}"
    else
      render 'new.html.erb'
    end
  end

  def show
    if params[:id] == 'random'
      @event = event.all.sample
    else
      @event = event.find_by(id: params[:id])
    end
    @videos = Video.all
  end

  def edit
    @event = Event.find_by(id: params[:id])
    render 'edit.html.erb'
  end

  def update
    @event = Event.find_by(id: params[:id])
    @event.assign_attributes()
    if @event.save
      flash[:success] = "event updated"
      redirect_to events_path 
    else
      flash[:warning] = @event.errors.full_messages.join(", ")
      render :edit
    end
  end

  def destroy
    @event = Event.find_by(id: params[:id])
    @event.destroy

    flash[:warning] = "#Event has been deleted"
    redirect_to "/pages/home"
  end
end